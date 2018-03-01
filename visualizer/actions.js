'use strict'

module.exports = createActions

function createActions ({flamegraph, svg}) {

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
    var tiersMode = false
    var optdMode = false 
    var notOptdMode = false
    return ({type}) => {
      switch (type) {
        case 'tiers':
          tiersMode = !tiersMode
          flamegraph.tiers(tiersMode)
          tiers.innerHTML = (tiersMode ? '−' : '+') + ' Tiers'
          return
        case 'optimized':
          optdMode = !optdMode
          if (!optdMode) return flamegraph.clear('yellow')
          flamegraph.search('\\*', 'yellow')
          return
        case 'not-optimized':
          notOptdMode = !notOptdMode
          if (!notOptdMode) return flamegraph.clear('lime')
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
      if (checked) flamegraph.typeShow(name)
      else flamegraph.typeHide(name)
    }
  }
}