'use strict'

module.exports = (render) => (action) => render`
  <div class="absolute" style="right: 5%; margin-right: 180px;top:8px"> 
    <button onclick=${() => action({type: 'out'})}>−</button>
    <button onclick=${() => action({type: 'in'})}>+</button> 
  </div>
`
