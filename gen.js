global.d3 = require('d3')
var flamer = require('./flamer')
module.exports = function (stacks, opts, next, done) {
  opts = opts || {}
  opts.name = opts.name || 'flamegraph'
  var dir = opts.dir || '.'
  var min = opts.min || 950


  var height = (diameter(stacks) * 18) + 2
  height = height < min ? min : height

  var browser = !!global.document

  var flamegraph = flamer()
    .width(browser ? innerWidth * .94 : height)
    .height(height)
    .tooltip(false)

  //concat name so browersify ignores
  var doc = browser ? document : require('js' + 'dom').jsdom()
  var style = doc.createElement('style')
  var chart = doc.createElement('chart')

  style.innerHTML = `
    chart {margin-left: 2%}
    .d3-flame-graph rect{stroke:#EEE;fill-opacity:.8}
    .d3-flame-graph rect:hover{stroke:#474747;stroke-width:.5;cursor:pointer}
    .d3-flame-graph .label{pointer-events:none;white-space:nowrap;text-overflow:ellipsis;overflow:hidden;font-size:12px;font-family:Verdana;margin-left:4px;margin-right:4px;line-height:1.5;padding:0;font-weight:400;color:#000;text-align:left}
  `

  doc.body.innerHTML = ''
  doc.body.appendChild(chart)

  var meta

  if (!browser) {
    meta = doc.createElement('meta')
    meta.setAttribute('charset', 'utf-8')
    doc.body.insertBefore(meta, doc.body.firstChild)
  }

  d3.select(chart).datum(stacks).call(flamegraph)
  var svg = chart.querySelector('svg')
  svg.insertBefore(style, svg.firstChild)

  if (!browser) {
    //TODO - create an SVG and generate a PNG from it, then show the PNG in iTerm
    // require('fs').writeFileSync('./out.svg', chart.innerHTML)
    //concat name so browersify ignores
    var fs = require('f' + 's')

    fs.writeFileSync(dir + '/' + opts.name + '.html', 
        doc.body.innerHTML + '<scr' + 'ipt>' + opts.script + '</scr' + 'ipt>')
  
    if (opts.preview) {
      svg.setAttribute('width', +svg.getAttribute('width')*2)
      next = next || function(){}
      require('./flame-' + 'image')(chart.innerHTML, {dir: dir}, next, function () {
        done && done()
      })
    } else {
      console.log('\n')
      next() && next()
      done() && done()
    }

  }
}

function diameter(tree) {
  var heights = {}

  function inner(node, height) {
    if (!node || !node.children) return
    for (var j = 0; j < node.children.length; j++) {
      inner(node.children[j], height + 1, i)
    }
    if (!heights[i]) {        
      heights[i] = height
    } else {
      heights[i] = heights[i] > height ? heights[i] : height
    }
  }

  for (var i = 0; i < tree.children.length; i++) {
    inner(tree.children[i], 0)
  }

  var max1 = 0, max2 = 0
  for (var i in heights) {
    if (heights[i] > max2) {
      max2 = heights[i]
      if (max2 > max1) {
        var temp = max1
        max1 = max2
        max2 = temp
      }
    }
  }
  return max1 + max2 + 1
}
