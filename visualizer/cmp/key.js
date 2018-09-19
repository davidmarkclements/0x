'use strict'

module.exports = (render) => ({ colors, enableOptUnopt }) => render`
  <div id=key class='fr dn db-l mr1'>
    <div class='fl' style="margin-right: 5px;">cold</div>
    <div class='fl' style="background: ${colors[0]}; height: 20px; width: 20px; margin-right: 5px;"></div>
    <div class='fl' style="background: ${colors[1]}; height: 20px; width: 20px; margin-right: 5px;"></div>
    <div class='fl' style="background: ${colors[2]}; height: 20px; width: 20px; margin-right: 5px;"></div>
    <div class='fl' style="background: ${colors[3]}; height: 20px; width: 20px; margin-right: 5px;"></div>
    <div class='fl' style="display: block; float: left; margin-right: 5px;">hot</div>
    ${enableOptUnopt
    ? render`<div class='cf f6 silver mt3 pt1' style='margin-left:-.35em'>
        <span>* optimized</span> <span class="indent">~ unoptimized</span>
        </div>
      `
    : ''
}
  </div>

`
