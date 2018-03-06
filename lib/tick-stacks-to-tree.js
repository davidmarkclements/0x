'use strict'

const debug = require('debug')('0x: tick-stacks-to-tree')

module.exports = tickStacksToTree

function tickStacksToTree (stacks, mapFrames, inlined) {
  const tree = {
    name: "",
    value: 0,
    top: 0,
    children: {__proto__: {toJSON: values}}
  }
  const inlineInfo = typeof inlined === 'object'
  stacks.forEach((stack) => {
    stack = stack.map(({name, kind, type}, ix) => {

      name = name.replace(/ (:[0-9]+:[0-9]+)/, (_, loc) => ` [eval]${loc}`)
      var S = 0  // state: 
                 // 0: no info (not a JS frame - currently only interested in optimization state)
                 // 1: unoptimized
                 // 2: optimized
                 // 3: pre-inlined
 
      if (type === 'JS') {
        if (name[0] === ' ') name = '(anonymous)' + name
        if (inlineInfo === true)  {
          const [ key ] = name.split(':')
          const info = inlined[key]
          if (info !== undefined) {
            const [ lookup ] = stack[ix - 1].name.split(':')
            const callerMatch = inlined[key].filter(({caller}) => caller.key === lookup)
            if (callerMatch.length > 0) {
              if (callerMatch.length === 1) {
                S = 3
                name += ' [PRE-INLINED]'
              } else {
                debug('multiple matches for inlined function, skipping')
              }
            }
          }
        }
        if (kind === 'Opt') {
          S = 2 
          name = '*' + name
        } 
        if (kind === 'Unopt') {
          S = 1
          name = '~' + name
        }
      }


      if (type && type !== 'JS') name += ' [' + type + (kind ? ':' + kind : '') + ']'
      return {S, name, value: 0, top: 0, children: {__proto__: {toJSON: values}}}
    })
    if (typeof mapFrames === 'function') stack = mapFrames(stack)
    if (!stack) return
    var lastFrame
    stack.forEach((frame, ix) => {
      const children = (ix === 0) ? tree.children : lastFrame.children
      lastFrame = frame = (children[frame.name] = (children[frame.name] || frame))
      if (ix === stack.length - 1) frame.top++
      if (ix === 0) tree.value += 1
      frame.value++
    })
  })

  return tree
}

function values () {
  const vals =  Object.values(this)
  if (vals.length === 0) return
  return vals
}