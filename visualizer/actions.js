'use strict'

module.exports = createActions

function createActions ({flamegraph, state}, emit) {
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

  function highlightTypeFilters () {
    return Object.assign(
      {},
      state.typeFilters.highlighted,
      Array.from(state.typeFilters.exclude).reduce((o, k) => {
        o[k] = state.typeFilters.unhighlighted[k]
        return o
      }, {}))
  }

  function control () {
    return ({type}) => {
      switch (type) {
        case 'tiers':
          state.control.tiers = !state.control.tiers
          flamegraph.tiers(state.control.tiers)
          state.typeFilters.bgs = state.control.tiers
            ? highlightTypeFilters()
            : state.typeFilters.unhighlighted
          emit(state)
          return
        case 'view':
          state.control.merged = !state.control.merged
          state.typeFilters.enablePreInlined = !state.control.merged
          state.key.enableOptUnopt = !state.control.merged
          emit(state)
          if (state.control.merged) flamegraph.renderTree(state.trees.merged)
          else flamegraph.renderTree(state.trees.unmerged)
          return
        case 'optimized':
          state.control.optimized = !state.control.optimized
          emit(state)
          if (!state.control.optimized) return flamegraph.clear('yellow')
          flamegraph.search(RegExp('^\\*'), 'yellow')
          return
        case 'not-optimized':
          state.control.unoptimized = !state.control.unoptimized
          emit(state)
          if (!state.control.unoptimized) return flamegraph.clear('lime')
          flamegraph.search(/^~/, 'lime')
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
      }
    }
  }

  function typeFilters () {
    return ({name}) => {
      const checked = state.typeFilters.exclude.has(name)
      if (checked) {
        flamegraph.typeShow(name)
        state.typeFilters.exclude.delete(name)
      } else {
        flamegraph.typeHide(name)
        state.typeFilters.exclude.add(name)
      }
      if (state.control.tiers) state.typeFilters.bgs = highlightTypeFilters()
      emit(state)
    }
  }
}
