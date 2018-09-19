'use strict'

module.exports = (render) => (action) => render`
  <div class='fr dn db-l h-100 mr1'>
    <button class='h-100' onclick=${() => action({ type: 'out' })}>−</button>
    <button class='h-100' onclick=${() => action({ type: 'in' })}>+</button>
  </div>
`
