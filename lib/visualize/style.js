'use strict'

const titleStyle = `color: rgb(68, 68, 68);`

module.exports = { bodyStyle, titleStyle }

function bodyStyle (bg) {
  var res = ''
  res += 'body { margin: 0px; padding: 2%; background:' + bg + '; font: 15px arial, sans-serif;}\n'
  res += 'rect:hover {opacity: 0.9}'
  return res
}