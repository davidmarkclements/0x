'use strict'

const button = (render) => ({label, pressed}, action) => render `
  <button class="f5 pointer br2 ba ph3 pv2 mb2 dib black ml2" style="${pressed ? 'box-shadow: inset 3px 3px 2px 0px rgba(0, 0, 0, 0.6)' : ''}" onclick=${action}>${label}</button>
`

module.exports = (render) => (state, action) => {
  const tiers = button(render)({label: 'Tiers', pressed: state.tiers}, () => action({type: 'tiers'}))
  const view = button(render)({label: state.merged ? 'Unmerge' : 'Merge', pressed: state.merged}, () => action({type: 'view'}))
  const optimized = state.merged ? '' : button(render)({label: 'Optimized', pressed: state.optimized}, () => action({type: 'optimized'}))
  const unoptimized = state.merged ? '' : button(render)({label: 'Unoptimized', pressed: state.unoptimized}, () => action({type: 'not-optimized'}))

  return render `
    <div style="position: absolute; bottom: 0px; left: 5%; margin-left: -35px; min-height: 5%;">
      ${tiers}${view}${optimized}${unoptimized}
    </div>
  `
}