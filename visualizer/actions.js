'use strict'

const hsl = require('hsl-to-rgb-for-reals')

module.exports = createActions

function createActions ({flamegraph, state}, emit) {
  const { colors } = flamegraph

  state.typeFilters.bgs = state.typeFilters.unhighlighted

  return {
    search, control, zoom, typeFilters
  }

  function search () {
    return ({value}) => {
      if (!value) return flamegraph.clear()
      flamegraph.search(value, 'cyan')
    }
  }

  function control () {
    return ({type}) => {
      switch (type) {
        case 'tiers':
          state.control.tiers = !state.control.tiers
          flamegraph.tiers(state.control.tiers)
          state.typeFilters.bgs = state.control.tiers ? 
            state.typeFilters.highlighted : 
            state.typeFilters.unhighlighted
          emit(state)
          return
        case 'view':
          state.control.merged = !state.control.merged
          state.typeFilters.showPreInlined = !state.control.merged
          emit(state)
          if (state.control.merged) flamegraph.renderTree(state.trees.merged)
          else flamegraph.renderTree(state.trees.unmerged)
          return
        case 'optimized':
          state.control.optimized = !state.control.optimized
          emit(state)
          if (!state.control.optimized) return flamegraph.clear('yellow')
          flamegraph.search('^\\*', 'yellow')
          return
        case 'not-optimized':
          state.control.unoptimized = !state.control.unoptimized
          emit(state)
          if (!state.control.unoptimized) return flamegraph.clear('lime')
          flamegraph.search('^~', 'lime')
          return
      }
    }
  }

  function zoom () {
    var zoomLevel = 1
    return ({type}) => {
      switch (type) {
        case 'in': 
          zoomLevel += 0.3
          if (zoomLevel > 1) zoomLevel = 1
          flamegraph.setGraphZoom(zoomLevel)
          return
        case 'out':
          zoomLevel -= 0.3
          if (zoomLevel < 0.1) zoomLevel = 0.1
          flamegraph.setGraphZoom(zoomLevel)
          return
      }
    }
  }

  function typeFilters () {
    return ({checked, name}) => {
      if (checked) {
        flamegraph.typeShow(name)
        state.typeFilters.exclude.delete(name)
      } else {
        flamegraph.typeHide(name)
        state.typeFilters.exclude.add(name)
      } 
    }
  }

}