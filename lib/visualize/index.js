/* global innerWidth d3*/
global.d3 = require('d3')
const hsl = require('hsl-to-rgb-for-reals')
const fg = require('d3-fg')
const bel = require('bel')
const createActions = require('./actions')
const graph = require('./cmp/graph')(bel)
const title = require('./cmp/title')(bel)
const ui = require('./cmp/ui')(bel)

module.exports = function (stacks, opts, done) {
  opts = opts || {}
  const min = opts.min || 950
  const bg = 'white'
  const exclude = ['v8']
  var height = (depth(stacks) * 18) + 10 + 2
  height = height < min ? min : height
  const width = innerWidth * 0.85

  const flamegraph = fg(opts)
    .width(width)
    .height(height)
    .tiers(false)
  
  exclude.forEach(flamegraph.typeHide)

  const chart = graph()
  d3.select(chart).datum(stacks).call(flamegraph)
  const svg = chart.querySelector('svg')
  svg.style.transition = 'transform 200ms ease-in-out'

  const initialState = {
    key: {
      colors: [
        fg.colorHash({top: 0, name: '?'}, 1, 100),
        fg.colorHash({top: 1, name: '?'}, 1, 100),
        fg.colorHash({top: 3, name: '?'}, 1, 100),
        fg.colorHash({top: 10, name: '?'}, 1, 100)
      ]
    },
    control: {
      states: {
        tiers: false,
        optimized: false,
        notOptimized: false
      }
    },
    typeFilters: { bg, exclude }
  }

  const actions = createActions({flamegraph, svg})
  document.body.appendChild(title(opts))
  document.body.appendChild(chart)
  document.body.appendChild(ui({initialState, actions}))

}

function depth (stacks) {
  var tree = d3.layout.tree()
  var deepest = 0
  tree.nodes(stacks).forEach(function (d) {
    if (d.depth > deepest) deepest = d.depth
  })
  return deepest + 1
}
