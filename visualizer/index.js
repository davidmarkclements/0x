'use strict'
const fg = require('d3-fg')
const render = require('nanohtml')
const morphdom = require('morphdom')
const debounce = require('debounce')
const createActions = require('./actions')
const createState = require('./state')
const graph = require('./cmp/graph')(render)
const ui = require('./cmp/ui')(render)

module.exports = function (trees, opts) {
  opts = opts || {}
  const { kernelTracing, visualizeCpuProfile } = opts
  const exclude = new Set(['cpp', 'regexp', 'v8', 'native', 'init'])

  const chart = graph()
  const tree = trees.unmerged // default view
  const categorizer = !kernelTracing && graph.v8cats
  const flamegraph = fg({
    categorizer,
    tree,
    exclude: Array.from(exclude),
    element: chart,
    topOffset: 55
  })
  const { colors } = flamegraph

  let userZoom = true // false if the last zoom call was initiated by 0x
  flamegraph.on('zoom', (d) => {
    if (!userZoom) {
      userZoom = true
      return
    }

    focusNode(d)
  })
  window.addEventListener('popstate', (event) => {
    userZoom = false
    jumpToState(event.state || {
      // No hash anymore, jump to root node (0) but don't change settings
      merged: state.control.merged,
      excludeTypes: Array.from(state.typeFilters.exclude),
      nodeId: 0
    })
  })

  window.addEventListener('resize', debounce(() => {
    const width = document.body.clientWidth * 0.89
    flamegraph.width(width).update()
  }, 150))

  const state = createState({ colors, trees, exclude, kernelTracing, title: opts.title, visualizeCpuProfile })

  const actions = createActions({ flamegraph, state }, (state) => {
    morphdom(iface, ui({ state, actions }))
  })
  const iface = ui({ state, actions })
  const focusNode = actions.focusNode()
  const jumpToState = actions.jumpToState()

  document.body.appendChild(chart)
  document.body.appendChild(iface)

  if (window.location.hash) {
    const st = parseHistoryState(window.location.hash.slice(1))
    if (st) {
      userZoom = false
      jumpToState(st)
    }
  }
}

function parseHistoryState (str) {
  try {
    return JSON.parse(decodeURIComponent(str))
  } catch (err) {
    // Just ignore if someone used an incorrect hash
    return null
  }
}
