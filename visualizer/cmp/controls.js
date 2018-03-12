'use strict'

const button = (render) => ({label, pressed, disabled, width}, action) => render `
  <button 
    class="f6 pointer br2 ba ph3 pv2 mb1 mt1 dib black ml2 ${disabled ? 'o-50 bg-silver' : ''}"
    ${disabled ? 'disabled' : ''}
    style="
      ${pressed ? 'box-shadow: inset 2px 2px 2px 0px rgba(0, 0, 0, 0.6);' : ''}
      ${width ? 'width: ' + width + ';' : ''}
    " 
    onclick=${action}
  >
    ${label}
  </button>
`

module.exports = (render) => (state, action) => {
  const tiers = button(render)({label: 'Tiers', pressed: state.tiers}, () => action({type: 'tiers'}))
  const view = button(render)({label: state.merged ? 'Unmerge' : 'Merge', width: '6.85em', pressed: state.merged}, () => action({type: 'view'}))
  const optimized = button(render)({label: 'Optimized', pressed: !state.merged && state.optimized, disabled: state.merged}, () => action({type: 'optimized'}))
  const unoptimized = button(render)({label: 'Unoptimized', pressed: !state.merged && state.unoptimized, disabled: state.merged}, () => action({type: 'not-optimized'}))

  return render `
    <div style="">
      ${tiers}${view}${optimized}${unoptimized}
    </div>
  `
}