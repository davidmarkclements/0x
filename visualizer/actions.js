'use strict'

const hsl = require('hsl-to-rgb-for-reals')

module.exports = createActions

function createActions ({flamegraph, svg, state}, emit) {

  const initialTypeFiltersBgs = Object.assign({}, state.typeFilters.bgs)
  window.state = state
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
          _typeFiltersColoring(state.control.tiers)
          emit(state)
          return
        case 'optimized':
          state.control.optimized = !state.control.optimized
          emit(state)
          if (!state.control.optimized) return flamegraph.clear('yellow')
          flamegraph.search('\\*', 'yellow')
          return
        case 'not-optimized':
          state.control.notOptimized = !state.control.notOptimized
          emit(state)
          if (!state.control.notOptimized) return flamegraph.clear('lime')
          flamegraph.search('~', 'lime')
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
          svg.style.transform = 'scale(' + zoomLevel + ')'
          return
        case 'out':
          zoomLevel -= 0.3
          if (zoomLevel < 0.1) zoomLevel = 0.1
          svg.style.transform = 'scale(' + zoomLevel + ')'
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

  function _typeFiltersColoring (tierModeEnabled) {
    if (tierModeEnabled === false) {
      state.typeFilters.bgs = initialTypeFiltersBgs
      return
    }

    state.typeFilters.bgs = {
      app: `rgb(${hsl(
        flamegraph.colors.app.h,
        flamegraph.colors.app.s / 100 * 1.2,
        flamegraph.colors.app.l / 100 * 1.2
      )})`, 
      deps: `rgb(${hsl(
        flamegraph.colors.deps.h,
        flamegraph.colors.deps.s / 100 * 1.2,
        flamegraph.colors.deps.l / 100 * 1.2
      )})`, 
      core: `rgb(${hsl(
        flamegraph.colors.core.h,
        flamegraph.colors.core.s / 100 * 1.2,
        flamegraph.colors.core.l / 100 * 1.2
      )})`, 
      native: `rgb(${hsl(
        flamegraph.colors.native.h,
        flamegraph.colors.native.s / 100 * 1.2,
        flamegraph.colors.native.l / 100 * 1.2
      )})`, 
      cpp: `rgb(${hsl(
        flamegraph.colors.cpp.h,
        flamegraph.colors.cpp.s / 100 * 1.2,
        flamegraph.colors.cpp.l / 100 * 1.2
      )})`, 
      regexp: `rgb(${hsl(
        flamegraph.colors.regexp.h,
        flamegraph.colors.regexp.s / 100 * 1.2,
        flamegraph.colors.regexp.l / 100 * 1.2
      )})`, 
      v8: `rgb(${hsl(
        flamegraph.colors.v8.h,
        flamegraph.colors.v8.s / 100 * 1.2,
        flamegraph.colors.v8.l / 100 * 1.2
     )})` 
    }

  }


}