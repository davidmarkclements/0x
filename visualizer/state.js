'use strict'

const hsl = require('hsl-to-rgb-for-reals')
const { colorHash } = require('d3-fg')

module.exports = ({ colors, trees, exclude, merged = false, kernelTracing, title, visualizeCpuProfile }) => ({
  trees,
  focusedNodeId: null,
  key: {
    colors: [
      colorHash({ top: 0, name: 'cold' }, 1, 100),
      colorHash({ top: 1, name: 'luke-warm' }, 1, 100),
      colorHash({ top: 3, name: 'warm' }, 1, 100),
      colorHash({ top: 10, name: 'hot' }, 1, 100)
    ],
    enableOptUnopt: !merged
  },
  title: { title },
  control: {
    tiers: false,
    optimized: false,
    unoptimized: false,
    renderMergedBtn: !kernelTracing,
    merged: merged,
    visualizeCpuProfile
  },
  typeFilters: {
    visualizeCpuProfile,
    enableInlinable: !merged,
    renderInlinable: !kernelTracing,
    unhighlighted: {
      inlinable: '#fff',
      app: '#fff',
      deps: '#fff',
      core: '#fff',
      wasm: '#fff',
      native: '#fff',
      cpp: '#fff',
      regexp: '#fff',
      v8: '#fff',
      init: '#fff'
    },
    highlighted: {
      inlinable: `rgb(${hsl(
        colors.inlinable.h,
        colors.inlinable.s / 100 * 1.2,
        colors.inlinable.l / 100 * 1.2
      )})`,
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
      wasm: `rgb(${hsl(
        colors.wasm.h,
        colors.wasm.s / 100,
        colors.wasm.l / 100
      )})`,
      native: `rgb(${hsl(
        colors.native.h,
        colors.native.s / 100 * 1.2,
        colors.native.l / 100 * 1.2
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
      )})`,
      init: `rgb(${hsl(
        colors.init.h,
        colors.init.s / 100 * 1.2,
        colors.init.l / 100 * 1.2
      )})`
    },
    exclude
  }
})
