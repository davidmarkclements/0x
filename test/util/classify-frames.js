'use strict'

const render = require('nanohtml')
const ticksToTree = require('../../lib/ticks-to-tree.js')
const { v8cats } = require('../../visualizer/cmp/graph.js')(render)

function getType (frame, inlined) {
  const processedFrame = Object.assign({}, frame, { name: getProcessedName(frame, inlined) })
  return getTypeProcessed(processedFrame)
}

function getTypeProcessed (frame) {
  return v8cats(frame).type
}

function getProcessedName (frame, inlined) {
  const { name } = frame

  if (inlined) {
    const parentName = 'evalParent :1:2'

    const key = name.split(':')[0]
    const options = {
      inlined: {}
    }
    options.inlined[key] = [{
      caller: { key: parentName.split(':')[0] }
    }]

    const tree = ticksToTree([[{ name: parentName }, frame]], options)
    return tree.unmerged.children[0].children[0].name
  } else {
    const tree = ticksToTree([[frame]])
    return tree.unmerged.children[0].name
  }
}

module.exports = {
  getType,
  getProcessedName
}
