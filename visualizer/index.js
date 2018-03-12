'use strict'
const fg = require('d3-fg')
const render = require('bel')
const morphdom = require('morphdom')
const createActions = require('./actions')
const createState = require('./state')
const graph = require('./cmp/graph')(render)
const title = require('./cmp/title')(render)
const ui = require('./cmp/ui')(render)

module.exports = function (trees, opts) {
  window.trees = trees

  opts = opts || {}
  const { kernelTracing } = opts
  const exclude = new Set(['cpp', 'regexp', 'v8', 'native'])

  const chart = graph()
  const tree = trees.unmerged // default view
  const categorizer = !kernelTracing && graph.v8cats
  const flamegraph = fg({categorizer, tree, exclude: Array.from(exclude), element: chart})
  const { colors } = flamegraph

  const state = createState({colors, trees, exclude})
  
  const actions = createActions({flamegraph, state}, (state) => {
    morphdom(iface, ui({state, actions}))
  })
  const iface = ui({state, actions})
  
  document.body.appendChild(title({title: opts.title}))
  document.body.appendChild(chart)
  document.body.appendChild(iface)
}
