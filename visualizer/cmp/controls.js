'use strict'

const button = (render) => ({label}, action) => render `
  <button class='ml2' onclick=${action}>${label}</button>
`

module.exports = (render) => ({states}, action) => {
  const tiers = button(render)({label: `${states.tiers ? '-' : '+'} Tiers`}, () => action({type: 'tiers'}))
  const optimized = button(render)({label: `${states.optimized ? '-' : '+'}  Optimized`}, () => action({type: 'optimized'}))
  const notOptimized = button(render)({label: `${states.notOptimized ? '-' : '+'}  Not Optimized`}, () => action({type: 'not-optimized'}))

  return render `
    <div style="position: absolute; bottom: 0px; left: 5%; min-height: 5%;">
      ${tiers}${optimized}${notOptimized}
    </div>
  `
}