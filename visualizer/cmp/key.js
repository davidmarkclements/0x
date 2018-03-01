'use strict'

module.exports = (render) => ({colors}) => render `

  <div style="position: absolute; top: 0.5em; right: 5%; margin-right: 240px">
    <div style="display: block; float: left; margin-right: 5px;">cold</div>
    <div style="background: ${colors[0]}; height: 20px; width: 20px; display: block; float: left; margin-right: 5px;"></div>
    <div style="background: ${colors[1]}; height: 20px; width: 20px; display: block; float: left; margin-right: 5px;"></div>
    <div style="background: ${colors[2]}; height: 20px; width: 20px; display: block; float: left; margin-right: 5px;"></div>
    <div style="background: ${colors[3]}; height: 20px; width: 20px; display: block; float: left; margin-right: 5px;"></div>
    <div style="display: block; float: left; margin-right: 5px;">hot</div>
  </div>

`