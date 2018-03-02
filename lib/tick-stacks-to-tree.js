'use strict'

module.exports = tickStacksToTree

function tickStacksToTree (stacks, mapFrames) {
  const tree = {
    name: "",
    value: 0,
    top: 0,
    children: {__proto__: {toJSON: values}}
  }

  stacks.forEach((stack) => {
    stack = stack.filter(({type}) => !type || type === 'JS')
    stack = stack.map(({name, kind, type}) => {
      if (name[0] === ' ') name = '(anonymous)' + name
      const fn = name
      if (kind === 'Opt') name = '*' + name
      if (kind === 'Unopt') name = '~' + name 
      return {fn, name, value: 0, top: 0, children: {__proto__: {toJSON: values}}}
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
