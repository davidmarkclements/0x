global.d3 = require('d3')
var flamer = require('./flamer')
module.exports = function (stacks, opts, next, done) {
  opts = opts || {}
  opts.name = opts.name || 'flamegraph'
  // opts.title = opts.title || 'Flamegraph'
  var dir = opts.dir || '.'
  var min = opts.min || 950
  var browser = !!global.document

  var langsMode = 'langs' in opts ? opts.langs : false
  var tiersMode = 'tiers' in opts ? opts.tiers : false

  var optdMode = false
  var notOptdMode = false

  var height = (diameter(stacks) * 18) + 10 + 2
  height = height < min ? min : height

  var width = height

  if (browser) {
    width = innerWidth * .87779
  }

  var flamegraph = flamer()
    .width(width)
    .height(height)
    .langs(langsMode)
    .tiers(tiersMode)

  //concat name so browersify ignores
  var doc = browser ? document : require('js' + 'dom').jsdom()
  var chart = doc.createElement('chart')
  var style = doc.createElement('style')
  var search = doc.createElement('input')
  var theme = doc.createElement('button')
  var tiers = doc.createElement('button')
  var langs = doc.createElement('button')
  var zoomout = doc.createElement('button')
  var zoomin = doc.createElement('button')
  var optd = doc.createElement('button')
  var notOptd = doc.createElement('button')

  search.placeholder = search.type = 'search  '
  theme.innerHTML = 'Theme'
  theme.style.position = 'absolute'
  theme.style.bottom = 0
  theme.style.left = '30px'

  langs.innerHTML = (langsMode ? '−' : '+ ') + ' Langs'
  langs.style.position = 'absolute'
  langs.style.bottom = 0
  langs.style.left = '86px'

  tiers.innerHTML = (tiersMode ? '−' : '+ ') + ' Tiers'
  tiers.style.position = 'absolute'
  tiers.style.bottom = 0
  tiers.style.left = '146px'

  optd.innerHTML = (optdMode ? '−' : '+ ') + 'Optimized'
  optd.style.position = 'absolute'
  optd.style.bottom = 0
  optd.style.left = '201'

  notOptd.innerHTML = (notOptdMode ? '−' : '+ ') + 'Not Optimized'
  notOptd.style.position = 'absolute'
  notOptd.style.bottom = 0
  notOptd.style.left = '284px'


  zoomout.innerHTML = '−'
  zoomout.style.position = 'absolute'
  zoomout.style.top = '6px'
  zoomout.style.right = '5%'
  zoomout.style.marginRight = '160px'

  zoomin.innerHTML = '+'
  zoomin.style.position = 'absolute'
  zoomin.style.top = '6px'
  zoomin.style.right = '5%'
  zoomin.style.marginRight = '138px'

  style.innerHTML = 'body {padding-left: 2%;background:black}'

  doc.body.style.transition = 'background 500ms ease-in-out'
  doc.body.style.background = 'black'
  theme.addEventListener('click', function () {
    var bg = doc.body.style.background
    doc.body.style.background = bg === 'black' ? 'white' : 'black'
  })

  search.style = 'position:absolute;top:.5em; right: 5%'
  search.addEventListener('search', function (e) {
    if (!e.target.value) return flamegraph.clear()
    flamegraph.search(e.target.value)
  })

  search.addEventListener('keydown', function (e) {
    setTimeout(function () {
      if (!e.target.value) return flamegraph.clear()
      flamegraph.search(e.target.value)  
    }, 0)    
  })  

  var zoom = 1
  zoomout.addEventListener('click', function () {
    zoom -= .3
    if (zoom < 0.1) zoom = 0.1
    svg.style.transform = 'scale(' + zoom + ')'
  })
  zoomin.addEventListener('click', function () {
    zoom += .3
    if (zoom > 1) zoom = 1
    svg.style.transform = 'scale(' + zoom + ')'
  })

  langs.addEventListener('click', function () {
    langsMode = !langsMode
    flamegraph.langs(langsMode)
    langs.innerHTML = (langsMode ? '−' : '+ ') + ' Langs'
    if (langsMode) {
      tiersMode = false
      tiers.innerHTML = (tiersMode ? '−' : '+ ') + ' Tiers'
    }
  })

  tiers.addEventListener('click', function () {
    tiersMode = !tiersMode
    flamegraph.tiers(tiersMode)
    tiers.innerHTML = (tiersMode ? '−' : '+ ') + ' Tiers'
    if (tiersMode) {
      langsMode = false
      langs.innerHTML = (langsMode ? '−' : '+ ') + ' Langs'
    }
  })

  optd.addEventListener('click', function () {
    optdMode = !optdMode
    if (!optdMode) return flamegraph.clear('yellow')
    flamegraph.search('\\*', 'yellow')
  })
  notOptd.addEventListener('click', function () {
    notOptdMode = !notOptdMode
    if (!notOptdMode) return flamegraph.clear('salmon')
    flamegraph.search('~', 'salmon')
  })

  doc.body.innerHTML = ''
  doc.body.appendChild(style)
  doc.body.appendChild(chart)
  doc.body.appendChild(search)
  doc.body.appendChild(theme)
  doc.body.appendChild(langs)
  doc.body.appendChild(tiers)
  doc.body.appendChild(zoomout)
  doc.body.appendChild(zoomin)
  doc.body.appendChild(optd)
  doc.body.appendChild(notOptd)

  var meta

  chart.style = 'padding-left: 5%;padding-right:5%;display: block;overflow-y: scroll;overflow-x:hidden;height: 90%;'

  if (!browser) {
    meta = doc.createElement('meta')
    meta.setAttribute('charset', 'utf-8')
    doc.body.insertBefore(meta, doc.body.firstChild)
  }

  d3.select(chart).datum(stacks).call(flamegraph)
  var svg = chart.querySelector('svg')
  svg.style.transition = 'transform 200ms ease-in-out'

  if (opts.title) {
    var head = doc.createElement('h1')
    head.innerHTML = opts.title
    head.style.color = '#444'
    doc.body.insertBefore(head, doc.body.firstChild)
  }


  if (!browser) {
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

function diameter(stacks) {
  var tree = d3.layout.tree()
  var deepest = 0
  tree.nodes(stacks).forEach(function (d) {
    if (d.depth > deepest) deepest = d.depth
  })
  return deepest + 1
}
