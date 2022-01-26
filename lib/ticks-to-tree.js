'use strict'

const { spawnSync } = require('child_process')
const { join } = require('path')
const debug = require('debug')('0x: ticks-to-tree')
const escape = require('escape-string-regexp')

const preloadDirRx = RegExp(join(escape(__dirname), 'preload'))
const internalModuleRegExp = /^.?(?:\(anonymous\)|internalBinding|NativeModule[^ ]*) (node:)?[^/\\][a-zA-Z0-9_/\\-]+(\.js)?:\d+:\d+$/
const nodeBootstrapRegExp = / (node:)?internal\/bootstrap.+(\.js)?:\d+(:?\d+)$/

module.exports = ticksToTree

function hasFileLocation (jsFrameName) {
  // perf samples doesn't contains the column number
  return /:\d+(:\d+)?$/.test(jsFrameName)
}

function ticksToTree (ticks, options = {}) {
  const { mapFrames, inlined, pathToNodeBinary = process.execPath } = options
  const merged = {
    name: 'all stacks',
    value: 0,
    top: 0,
    children: []
  }
  const unmerged = {
    name: 'all stacks',
    value: 0,
    top: 0,
    children: []
  }
  const inlineInfo = typeof inlined === 'object'

  // Spawn a file that throws an error to get the loading stack.
  // Then create a regular expression that matches all those files.
  const stackArgs = ['--experimental-modules', '--no-warnings', join(__dirname, 'loading-stacks.js')]
  let stackChild = spawnSync(pathToNodeBinary, stackArgs)
  if (stackChild.stderr.toString().includes('--experimental-modules')) {
    // Future proof to make sure it works even if the `experimental-modules` flag is removed.
    stackArgs.shift()
    stackChild = spawnSync(pathToNodeBinary, stackArgs)
  }
  const stackRegExpStr = stackChild.stdout.toString()
  if (!stackRegExpStr) {
    throw new Error('0x/lib/random-require.js returned an empty RegExp string. This may be ' +
    'because of interference in the child process. One known cause is Tap tests with coverage enabled on Node 8.')
  }
  const regExp = new RegExp(stackRegExpStr)

  ticks.forEach((stack) => {
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
      let S = 0

      if (type === 'JS') {
        if (name[0] === ' ') name = '(anonymous)' + name
        if (inlineInfo === true) {
          const [key] = name.split(/:[0-9]+:[0-9]+/)
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
              const [lookup] = stack[ix - 1] ? (stack[ix - 1].name.split(':')) : []
              const callerMatch = inlined[key].find(({ caller }) => caller.key === lookup)
              if (callerMatch) S += 2
            }
          }
        }

        // Sparkplug is a new baseline, non-optimising second-tier compiler,
        // designed to fit in the compiler trade-off space between Ignition and
        // TurboProp/TurboFan.
        if (kind === 'Unopt' || kind === 'Baseline') S += 1
        else if (kind === 'Opt') S += 2

        if (!hasFileLocation(name)) {
          type = 'WASM'
        }
      }

      if (type && type !== 'JS') name += ' [' + type + (kind ? ':' + kind : '') + ']'
      return { S, name, value: 0, top: 0 }
    })

    labelInitFrames(stack, regExp)

    addToMergedTree(stack.map(({ S, name, value, top }) => ({ S, name, value, top })))
    // mutate original (save another loop over stack + extra objects)
    addToUnmergedTree(stack)
  })

  function addToMergedTree (stack) {
    let lastFrame = null
    stack.forEach((frame, ix) => {
      // TODO need an elegant way to place inlined frames into *other* stacks
      // where the function has disappeared – for now we just remove inlined
      // stacks from merged graphs
      if (frame.S > 2) return // skip inlined
      if (ix > 0) lastFrame.children = lastFrame.children || []
      const children = (ix === 0) ? merged.children : lastFrame.children
      const child = children.find(({ name }) => name === frame.name)

      if (child === undefined) children.push(frame)
      else frame = child

      if (ix === stack.length - 1) frame.top++
      if (ix === 0) merged.value += 1
      frame.value++

      lastFrame = frame
    })
  }

  function addToUnmergedTree (stack) {
    let lastFrame = null
    stack.forEach((frame, ix) => {
      // TODO need an elegant way to place inlined frames into *other* stacks
      // where the function has disappeared – for now we just remove inlined
      // stacks from merged graphs
      // adding children here means we avoid unnecessary arrays
      if (ix > 0) lastFrame.children = lastFrame.children || []
      const children = (ix === 0) ? unmerged.children : lastFrame.children
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
      if (ix === 0) unmerged.value += 1
      frame.value++

      lastFrame = frame
    })
  }

  return { merged, unmerged }
}

function labelInitFrames (frames, loadingFrameRegExp) {
  let foundNodeModule = false
  for (let i = frames.length - 1; i >= 0; i--) {
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
