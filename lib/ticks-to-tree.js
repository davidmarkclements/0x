'use strict'

const { spawnSync } = require('child_process')
const { existsSync, readFileSync } = require('fs')
const { join, resolve, basename, dirname, relative, isAbsolute } = require('path')
const { SourceMapConsumer } = require('source-map')
const readLastLines = require('read-last-lines')

const debug = require('debug')('0x: ticks-to-tree')

const preloadDirRx = RegExp(join(__dirname, 'preload'))
const internalModuleRegExp = /^.?(?:\(anonymous\)|internalBinding|NativeModule[^ ]*) [^/\\][a-zA-Z0-9_/\\-]+\.js:\d+:\d+$/
const nodeBootstrapRegExp = / internal\/bootstrap.+\.js:\d+:\d+$/

module.exports = ticksToTree

let globalOptions
async function ticksToTree (ticks, options = {}) {
  const { mapFrames, inlined, sourceMaps, relativePath, pathToNodeBinary = process.execPath } = options

  globalOptions = { sourceMaps, relativePath }
  const trees = {
    merged: {
      name: 'all stacks',
      value: 0,
      top: 0,
      children: []
    },
    unmerged: {
      name: 'all stacks',
      value: 0,
      top: 0,
      children: []
    }
  }
  const inlineInfo = typeof inlined === 'object'

  // Spawn a file that throws an error to get the loading stack.
  // Then create a regular expression that matches all those files.
  let childStderr = spawnSync(pathToNodeBinary, ['--experimental-modules', join(__dirname, 'loading-stacks')]).stderr.toString()
  if (childStderr.includes('--experimental-modules')) {
    // Future proof to make sure it works even if the `experimental-modules` flag is removed.
    childStderr = spawnSync(pathToNodeBinary, [join(__dirname, 'loading-stacks')])
  }
  const stacks = childStderr
    .match(/ \(.+?:/g)
    .map((e) => e.slice(2))
    .filter((e) => e[0] !== '/' && e[0] !== '\\')
  let regExpStr = '('
  let separator = ''
  for (const frame of new Set(stacks)) {
    regExpStr += `${separator} ${frame.replace(/\\/g, '\\\\').replace(/\./g, '\\.')}\\d+:\\d+`
    separator = '|'
  }
  regExpStr += ')$'
  const regExp = new RegExp(regExpStr)

  const jsLibraries = {}
  ticks.map((stack) => {
    stack = removeInstrumentationFrames(stack)
    if (typeof mapFrames === 'function') stack = mapFrames(stack)
    if (!stack) return
    stack = stack.map(({ name, kind, type }, ix) => {
      name = name.replace(/ (:[0-9]+:[0-9]+)/, (_, loc) => ` [eval]${loc}`)
      // 0 no info
      // 1 unoptimized
      // 2 optimized
      // 3 inlinable unoptimized
      // 4 inlinable optimized
      var S = 0

      if (type === 'JS') {
        if (name[0] === ' ') name = '(anonymous)' + name
        if (inlineInfo === true) {
          const [ key ] = name.split(':')
          const info = inlined[key]
          if (info !== undefined) {
            const sameFn = info.length === 1 || info.every(({ pos }, ix) => {
              const prev = info[ix - 1]
              if (!prev) return true
              return prev.pos === pos
            })
            if (sameFn === false) {
              // todo: need examples of this occurring in the wild
              // resolve this edge case as follows (if we can actually reproduce it):
              // collect stack frames with same key (fn + file) but different line:col
              // if the amount of stacks frames with same key matches size of `info`
              // then they can all be marked as inlinable
              // if not then,
              // sort functions in inlined by position
              // collect stack frames with same key (fn + file) but sort
              // them by line:col (const [ key, line, col ] = name.split(':'))
              // -- any stack frames that exceed length of info are *not* inlinable
              // the rest are
              debug(`multiple functions name collision in file skipping ${key}`)
            } else {
              const [ lookup ] = stack[ix - 1] ? (stack[ix - 1].name.split(':')) : []
              const callerMatch = inlined[key].find(({ caller }) => caller.key === lookup)
              if (callerMatch) S += 2
            }
          }
          if (sourceMaps !== null) {
            jsLibraries[key.split(' ')[1]] = true
          }
        }
        if (kind === 'Unopt') S += 1
        else if (kind === 'Opt') S += 2
      }
      if (type && type !== 'JS') name += ' [' + type + (kind ? ':' + kind : '') + ']'
      return { S, name, type, value: 0, top: 0 }
    })
    labelInitFrames(stack, regExp)

    addToMergedTree(trees, stack.map(({ S, name, type, value, top }) => ({ S, name, type, value, top })))
    // mutate original (save another loop over stack + extra objects)
    addToUnmergedTree(trees, stack)
  })

  if (sourceMaps !== null) {
    await Promise.all(Object.keys(jsLibraries).map(async (jsLibrary) => {
      return loadSourceMap(jsLibrary, sourceMaps)
    }))
  }
  if (sourceMaps !== null || relativePath) {
    Object.keys(trees).map((tree) => {
      trees[tree].children.map((frame, index) => {
        renameFrame(frame)
      })
    })
  }
  Object.keys(loadedSourceMaps).forEach((file) => {
    if (loadedSourceMaps[file] !== false) {
      loadedSourceMaps[file].destroy()
    }
  })

  return trees
}

const loadedSourceMaps = {}
async function loadSourceMap (fileName, sourceMaps) {
  if (typeof loadedSourceMaps[fileName] === 'undefined') {
    const sourceMapFiles = [
      sourceMaps[fileName],
      sourceMaps[basename(fileName)],
      fileName + '.map' // dist.js -> dist.js.map
    ]

    if (existsSync(fileName)) {
      const lastLine = await readLastLines.read(fileName, 1)
      const sourceMapMatch = lastLine.match(/#\s+sourceMappingURL=([^\s]+)/i)
      if (sourceMapMatch) {
        sourceMapFiles.unshift(resolve(dirname(fileName), sourceMapMatch[1]))
      }
    }

    for (let i = 0; i < sourceMapFiles.length; i++) {
      if (sourceMapFiles[i]) {
        // convert relative source map paths to absolute paths
        if (!isAbsolute(sourceMapFiles[i])) {
          sourceMapFiles[i] = resolve(dirname(fileName), sourceMapFiles[i])
        }

        if (existsSync(sourceMapFiles[i])) {
          try {
            debug(`loading source map from ${sourceMapFiles[i]}`)
            const sourceMap = JSON.parse(readFileSync(sourceMapFiles[i]))
            loadedSourceMaps[fileName] = await new SourceMapConsumer(sourceMap)
            if (!loadedSourceMaps[fileName].sourceRoot) {
              loadedSourceMaps[fileName].sourceRoot = dirname(sourceMapFiles[i])
            }
            break
          } catch (e) {
            console.error(e)
          }
        }
      }
    }

    loadedSourceMaps[fileName] = loadedSourceMaps[fileName] || false
  }
}

function nameFromSourceMap (name) {
  const key = name.split(' ', 2)
  const [ fileName, line, column ] = key[1].split(':')

  if (loadedSourceMaps[fileName]) {
    try {
      const source = loadedSourceMaps[fileName].originalPositionFor({
        line: parseInt(line),
        column: parseInt(column)
      })

      if (source.source) {
        name = `${key[0]} ${source.source}:${source.line}:${source.column}`
      }
    } catch (err) {
      console.error(err, fileName, line, column)
    }
  }

  return name
}

function renameFrame (frame) {
  if (frame.type === 'JS') {
    if (globalOptions.sourceMaps !== null && frame.name.slice(0, 11) !== '(anonymous)') {
      frame.name = nameFromSourceMap(frame.name)
    }

    if (globalOptions.relativePath) {
      const key = frame.name.split(' ', 2)
      const [ fileName, line, column ] = key[1].split(':')

      // only rename when fileName is an absolute path
      if (isAbsolute(fileName)) {
        const relativeName = relative(globalOptions.relativePath, fileName)
        frame.name = `${key[0]} ${relativeName}:${line}:${column}`
      }
    }
  }
  if (frame.children && frame.children.length) {
    frame.children.forEach((child) => renameFrame(child))
  }
  delete frame.type
}

function addToMergedTree (trees, stack) {
  var lastFrame = null
  stack.forEach((frame, ix) => {
    // TODO need an elegant way to place inlined frames into *other* stacks
    // where the function has disappeared – for now we just remove inlined
    // stacks from merged graphs
    if (frame.S > 2) return // skip inlined
    if (ix > 0) lastFrame.children = lastFrame.children || []
    const children = (ix === 0) ? trees.merged.children : lastFrame.children
    const child = children.find(({ name }) => name === frame.name)

    if (child === undefined) children.push(frame)
    else frame = child

    if (ix === stack.length - 1) frame.top++
    if (ix === 0) trees.merged.value += 1
    frame.value++

    lastFrame = frame
  })
}

function addToUnmergedTree (trees, stack) {
  var lastFrame = null
  stack.forEach((frame, ix) => {
    // TODO need an elegant way to place inlined frames into *other* stacks
    // where the function has disappeared – for now we just remove inlined
    // stacks from merged graphs
    // adding children here means we avoid unnecessary arrays
    if (ix > 0) lastFrame.children = lastFrame.children || []
    const children = (ix === 0) ? trees.unmerged.children : lastFrame.children
    const child = children.find(({ fn, S }) => {
      return fn === frame.name && S === frame.S
    })

    if (child === undefined) {
      frame.fn = frame.name
      if (frame.S === 1) frame.name = '~' + frame.name
      else if (frame.S === 2) frame.name = '*' + frame.name
      else if (frame.S === 3) frame.name = '~' + frame.name + ' [INLINABLE]'
      else if (frame.S === 4) frame.name = '*' + frame.name + ' [INLINABLE]'
      children.push(frame)
    } else frame = child

    if (ix === stack.length - 1) frame.top++
    if (ix === 0) trees.unmerged.value += 1
    frame.value++

    lastFrame = frame
  })
}

function labelInitFrames (frames, loadingFrameRegExp) {
  let foundNodeModule = false
  for (var i = frames.length - 1; i >= 0; i--) {
    const frame = frames[i]
    if (foundNodeModule) {
      frame.name += ' [INIT]'
      frame.isInit = true
    // The last module initialization. This is only Node.js internally.
    // All frames before have to be internal as well.
    } else if (internalModuleRegExp.test(frame.name) ||
               // Node.js 10 has some more bootstrapping code.
               nodeBootstrapRegExp.test(frame.name)) {
      foundNodeModule = true
      frame.name += ' [INIT]'
      frame.isInit = true
    // Loading frames that we matches earlier.
    } else if (loadingFrameRegExp.test(frame.name)) {
      frame.name += ' [INIT]'
      frame.isInit = true
    }
  }
}

function removeInstrumentationFrames (frames) {
  return frames.filter((frame) => preloadDirRx.test(frame.name) === false)
}
