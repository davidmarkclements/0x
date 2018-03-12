'use strict'

const { colorHash } = require('d3-fg')

module.exports = ({colors, trees, exclude, merged = false}) => ({
  trees,
  key: {
    colors: [
      colorHash({top: 0, name: 'cold'}, 1, 100),
      colorHash({top: 1, name: 'luke-warm'}, 1, 100),
      colorHash({top: 3, name: 'warm'}, 1, 100),
      colorHash({top: 10, name: 'hot'}, 1, 100)
    ]
  },
  control: {
    tiers: false,
    optimized: false,
    unoptimized: false,
    merged: merged
  },
  typeFilters: {
    showPreInlined: !merged,
    unhighlighted: {
      app: '#fff',
      deps: '#fff',
      core: '#fff',
      native: '#fff',
      cpp: '#fff',
      regexp: '#fff',
      v8: '#fff'
    },
    highlighted: {
      app: `rgb(${hsl(
        colors.app.h,
        colors.app.s / 100 * 1.2,
        colors.app.l / 100 * 1.2
      )})`, 
      deps: `rgb(${hsl(
        colors.deps.h,
        colors.deps.s / 100 * 1.2,
        colors.deps.l / 100 * 1.2
      )})`, 
      core: `rgb(${hsl(
        colors.core.h,
        colors.core.s / 100 * 1.2,
        colors.core.l / 100 * 1.2
      )})`, 
      native: `rgb(${hsl(
        colors.native.h,
        colors.native.s / 100 * 1.2,
        colors.native.l / 100 * 1.2
      )})`, 
      'pre-inlined': `rgb(${hsl(
        colors['pre-inlined'].h,
        colors['pre-inlined'].s / 100 * 1.2,
        colors['pre-inlined'].l / 100 * 1.2
      )})`,  
      cpp: `rgb(${hsl(
        colors.cpp.h,
        colors.cpp.s / 100 * 1.2,
        colors.cpp.l / 100 * 1.2
      )})`, 
      regexp: `rgb(${hsl(
        colors.regexp.h,
        colors.regexp.s / 100 * 1.2,
        colors.regexp.l / 100 * 1.2
      )})`, 
      v8: `rgb(${hsl(
        colors.v8.h,
        colors.v8.s / 100 * 1.2,
        colors.v8.l / 100 * 1.2
      )})` 
    },
    exclude 
  }
})