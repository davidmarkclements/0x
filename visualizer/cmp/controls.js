'use strict'

const button = (render) => ({label}, action) => render `
  <button class="f5 pointer dim br2 ba ph3 pv2 mb2 dib black ml2" onclick=${action}>${label}</button>
`

module.exports = (render) => (state, action) => {
  const tiers = button(render)({label: `${state.tiers ? '–' : '+'} Tiers`}, () => action({type: 'tiers'}))
  const optimized = button(render)({label: `${state.optimized ? '–' : '+'}  Optimized`}, () => action({type: 'optimized'}))
  const unoptimized = button(render)({label: `${state.unoptimized ? '–' : '+'}  Unoptimized`}, () => action({type: 'not-optimized'}))

  return render `
    <div style="position: absolute; bottom: 0px; left: 5%; margin-left: -35px; min-height: 5%;">
      ${tiers}${optimized}${unoptimized}
    </div>
  `
}