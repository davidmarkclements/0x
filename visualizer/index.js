/* global innerWidth d3*/
global.d3 = require('d3')
const fg = require('d3-fg')
const bel = require('bel')
const morphdom = require('morphdom')
const createActions = require('./actions')
const graph = require('./cmp/graph')(bel)
const title = require('./cmp/title')(bel)
const ui = require('./cmp/ui')(bel)

module.exports = function (stacks, opts, done) {
  opts = opts || {}
  const min = opts.min || 950
  const exclude = new Set(['cpp', 'regexp', 'v8'])
  var height = (depth(stacks) * 18) + 10 + 2
  height = height < min ? min : height
  const width = innerWidth * 0.85

  if (!opts.kernelTracing) opts.categorizer = v8cats

  const flamegraph = fg(opts)
    .width(width)
    .height(height)
    .tiers(false)
  
  Array.from(exclude).forEach(flamegraph.typeHide)

  const chart = graph()
  d3.select(chart).datum(stacks).call(flamegraph)
  const svg = chart.querySelector('svg')
  svg.style.transition = 'transform 200ms ease-in-out'

  const state = {
    key: {
      colors: [
        fg.colorHash({top: 0, name: '?'}, 1, 100),
        fg.colorHash({top: 1, name: '?'}, 1, 100),
        fg.colorHash({top: 3, name: '?'}, 1, 100),
        fg.colorHash({top: 10, name: '?'}, 1, 100)
      ]
    },
    control: {
      tiers: false,
      optimized: false,
      unoptimized: false
    },
    typeFilters: {
      bgs: {
        app: '#fff',
        deps: '#fff',
        core: '#fff',
        native: '#fff',
        cpp: '#fff',
        regexp: '#fff',
        v8: '#fff'
      }, 
      exclude 
    }
  }
  
  const actions = createActions({flamegraph, svg, state}, (state) => {
    morphdom(iface, ui({state, actions}))
  })
  var iface = ui({state, actions})
  document.body.appendChild(title(opts))
  document.body.appendChild(chart)
  document.body.appendChild(iface)

}

function depth (stacks) {
  var tree = d3.layout.tree()
  var deepest = 0
  tree.nodes(stacks).forEach(function (d) {
    if (d.depth > deepest) deepest = d.depth
  })
  return deepest + 1
}


function v8cats (child) {
  var name = child.name
  if (!/\.js/.test(name)) {
    switch (true) {
      case /\[CODE:RegExp\]/.test(name): return {type: 'regexp'}
      case /\[CODE:.*\]/.test(name): return {type: 'v8'}
      case /\.$/.test(name): return {type: 'core'}
      case /\[CPP\]/.test(name): return {type: 'cpp'}
      case /\[SHARED_LIB\]/.test(name): return {type: 'cpp'}
      case /\[eval\]/.test(name): return {type: 'native'} // unless we create an eval checkbox
                                                          // "native" is the next best label since
                                                          // you cannot tell where the eval comes
                                                          // from (app, deps, core)
      default: return {type: 'v8'}
    }
  }

  switch (true) {
    case /\[PRE-INLINED\]/.test(name): return {type: 'pre-inlined'}
    case / native /.test(name): return {type: 'native'}
    case (name.indexOf('/') === -1 || /internal\//.test(name) && !/ \//.test(name)): return {type: 'core'}
    case /node_modules/.test(name): return {type: 'deps'}
    default: return {type: 'app'}
  }
}