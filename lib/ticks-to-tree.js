'use strict'

const debug = require('debug')('0x: ticks-to-tree')
const { join } = require('path')
module.exports = ticksToTree

function ticksToTree (ticks, mapFrames, inlined) {
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

  ticks.forEach((stack) => {
    stack = removeInstrumentationFrames(stack)
    if (typeof mapFrames === 'function') stack = mapFrames(stack)
    if (!stack) return
    stack = stack.map(({name, kind, type}, ix) => {
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
            const sameFn = info.length === 1 || info.every(({pos}, ix) => {
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
              const callerMatch = inlined[key].find(({caller}) => caller.key === lookup)
              if (callerMatch) S += 2
            }
          }
        }
        if (kind === 'Unopt') S += 1
        if (kind === 'Opt') S += 2
      }

      if (type && type !== 'JS') name += ' [' + type + (kind ? ':' + kind : '') + ']'
      return {S, name, value: 0, top: 0}
    })

    stack = labelInitFrames(stack)

    addToMergedTree(stack.map(({S, name, value, top}) => ({S, name, value, top})))
    // mutate original (save another loop over stack + extra objects)
    addToUnmergedTree(stack)
  })

  function addToMergedTree (stack) {
    var lastFrame = null
    stack.forEach((frame, ix) => {
      // TODO need an elegant way to place inlined frames into *other* stacks
      // where the function has disappeared – for now we just remove inlined
      // stacks from merged graphs
      if (frame.S > 2) return // skip inlined
      if (ix > 0) lastFrame.children = lastFrame.children || []
      const children = (ix === 0) ? merged.children : lastFrame.children
      const child = children.find(({name}) => name === frame.name)

      if (child === undefined) children.push(frame)
      else frame = child

      if (ix === stack.length - 1) frame.top++
      if (ix === 0) merged.value += 1
      frame.value++

      lastFrame = frame
    })
  }

  function addToUnmergedTree (stack) {
    var lastFrame = null
    stack.forEach((frame, ix) => {
      // TODO need an elegant way to place inlined frames into *other* stacks
      // where the function has disappeared – for now we just remove inlined
      // stacks from merged graphs
      // adding children here means we avoid unnecessary arrays
      if (ix > 0) lastFrame.children = lastFrame.children || []
      const children = (ix === 0) ? unmerged.children : lastFrame.children
      const child = children.find(({fn, S}) => {
        return fn === frame.name && S === frame.S
      })

      if (child === undefined) {
        frame.fn = frame.name
        if (frame.S === 1) frame.name = '~' + frame.name
        if (frame.S === 2) frame.name = '*' + frame.name
        if (frame.S === 3) frame.name = '~' + frame.name + ' [INLINABLE]'
        if (frame.S === 4) frame.name = '*' + frame.name + ' [INLINABLE]'
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


function labelInitFrames (frames) {
  const startupBootstrapNodeIndex = frames.findIndex(({name}, ix) => {
    if (frames[ix + 1] && /Module.runMain module\.js/.test(frames[ix + 1].name)) return false
    return /startup bootstrap_node\.js/.test(name) 
  })

  if (startupBootstrapNodeIndex !== -1) {
    frames.slice(startupBootstrapNodeIndex + 1).forEach((frame) => {
      if (frame.isInit) return
      frame.name += ' [INIT]'
      frame.isInit = true
    })
  }

  const moduleRunMainIndex = frames.findIndex(({name}, ix) => {
    return /Module.runMain module\.js/.test(name) 
  })

  if (moduleRunMainIndex !== -1) {
    frames.slice(moduleRunMainIndex + 1).forEach((frame) => {
      if (frame.isInit) return
      if (/.+ (internal\/)?module\.js/.test(frame.name)) frame.name += ' [INIT]'
      frame.isInit = true
    })
  }

  // if there's so many modules to load, the module requiring may 
  // actually go into another tick, so far that's been observed where Module.load
  // is the first function, but there could be variation...

  const partOfModuleLoadingCycle = frames.findIndex(({name}, ix) => {
    return /(Module\.load|Module\._load|tryModuleLoad|Module\._extensions.+|Module\._compile|Module.require|require internal.+) module\.js/.test(name) 
  })

  if (partOfModuleLoadingCycle === 0) {
    frames.forEach((frame) => {
      if (frame.isInit) return
      if (/.+ (internal\/)?module\.js/.test(frame.name)) frame.name += ' [INIT]'
      frame.isInit = true
    })
  }


  return frames
}

function removeInstrumentationFrames (frames) {
  const preloadDirRx = RegExp(join(__dirname, 'preload'))
  return frames.filter((frame) => preloadDirRx.test(frame.name) === false)
}