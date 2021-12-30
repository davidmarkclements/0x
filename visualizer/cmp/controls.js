'use strict'

const button = (render) => ({ label, pressed, disabled, width }, action) => render`
  <button
    class="f6 pointer br2 ba ph3 pv1 dib black mb2 mt1 ml1 mr1 ${disabled ? 'o-50 bg-silver' : ''}"
    ${disabled ? 'disabled' : ''}
    style="
      ${pressed ? 'box-shadow: 0 0 0 .125em black;' : ''}
      ${width ? 'width: ' + width + ';' : ''}
    "
    onclick=${action}
  >
    ${label}
  </button>
`

module.exports = (render) => (state, action) => {
  const tiers = button(render)({ label: 'Tiers', pressed: state.tiers }, () => action({ type: 'tiers' }))
  const view = state.renderMergedBtn && !state.visualizeCpuProfile
    ? button(render)({
        label: state.merged ? 'Unmerge' : 'Merge',
        width: '6.85em',
        pressed: state.merged
      }, () => action({ type: 'view' }))
    : ''
  const optimized = state.visualizeCpuProfile
    ? ''
    : button(render)({
      label: 'Optimized',
      pressed: !state.merged && state.optimized,
      disabled: state.merged
    }, () => action({ type: 'optimized' }))
  const unoptimized = state.visualizeCpuProfile
    ? ''
    : button(render)({
      label: 'Unoptimized',
      pressed: !state.merged && state.unoptimized,
      disabled: state.merged
    }, () => action({ type: 'not-optimized' }))

  return render`
    <div style="">
      ${tiers}${view}${optimized}${unoptimized}
    </div>
  `
}
