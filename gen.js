/* global innerWidth d3*/
global.d3 = require('d3')
var hsl = require('hsl-to-rgb-for-reals')

var flamer = require('./flamer')
module.exports = function (stacks, opts, next, done) {
  opts = opts || {}
  opts.name = opts.name || 'flamegraph'

  var dir = opts.dir || '.'
  var min = opts.min || 950
  var browser = !!global.document

  var langsMode = 'langs' in opts ? opts.langs : false
  var tiersMode = 'tiers' in opts ? opts.tiers : false
  var bg = opts.theme === 'light' ? 'white' : 'black'

  var exclude = (opts.exclude || 'v8').split(',')
  var include = (opts.include || '').split(',')

  if (!~exclude.indexOf('v8')) exclude.push('v8')

  exclude = exclude.filter(function (s) {
    return !~include.indexOf(s)
  })

  var optdMode = false
  var notOptdMode = false


  if (!browser && !opts.svg) {
    var f = '<meta charset="utf-8">' +
            '<h1 style="color: rgb(68, 68, 68);">' + opts.title + '</h1>' +
            '<style>body {padding-left: 2%; background:black}rect:hover {opacity: 0.9}</style>' +
            '<chart></chart>' +
            '<scr' + 'ipt>' + opts.script + '</scr' + 'ipt>'

    if (opts.name === '-') {
      process.stdout.write(f)
    } else {
      require('f' + 's')
        .writeFileSync(dir + '/' + opts.name + '.html', f)
    }
    next && next()
    done && done()
    return
  }

  var height = (diameter(stacks) * 18) + 10 + 2
  height = height < min ? min : height

  var width = height

  if (browser) {
    width = innerWidth * 0.87779
  }

  var flamegraph = flamer(opts)
    .width(width)
    .height(height)
    .langs(langsMode)
    .tiers(tiersMode)

  exclude.forEach(flamegraph.typeHide)

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

  // auto-scroll to buttom of chart when content is loaded
  doc.addEventListener("DOMContentLoaded", function(event) {
    var element = doc.querySelector("chart");
    element.scrollTop = element.scrollHeight;
  });

  var v8 = doc.createElement('input')
  v8.type = 'checkbox'
  v8.id = 'v8'
  var v8Label = doc.createElement('label')
  v8Label.appendChild(v8)
  v8Label.appendChild(doc.createTextNode('v8   '))

  var regexp = doc.createElement('input')
  regexp.type = 'checkbox'
  regexp.id = 'regexp'
  var regexpLabel = doc.createElement('label')
  regexpLabel.appendChild(regexp)
  regexpLabel.appendChild(doc.createTextNode('regexp   '))

  var nativeC = doc.createElement('input')
  nativeC.type = 'checkbox'
  nativeC.id = 'nativeC'
  var nativeCLabel = doc.createElement('label')
  nativeCLabel.appendChild(nativeC)
  nativeCLabel.appendChild(doc.createTextNode('nativeC   '))

  var nativeJS = doc.createElement('input')
  nativeJS.type = 'checkbox'
  nativeJS.id = 'nativeJS'
  var nativeJSLabel = doc.createElement('label')
  nativeJSLabel.appendChild(nativeJS)
  nativeJSLabel.appendChild(doc.createTextNode('nativeJS   '))

  var app = doc.createElement('input')
  app.type = 'checkbox'
  app.id = 'app'
  var appLabel = doc.createElement('label')
  appLabel.appendChild(app)
  appLabel.appendChild(doc.createTextNode('app   '))

  var deps = doc.createElement('input')
  deps.type = 'checkbox'
  deps.id = 'deps'
  var depsLabel = doc.createElement('label')
  depsLabel.appendChild(deps)
  depsLabel.appendChild(doc.createTextNode('deps   '))

  var core = doc.createElement('input')
  core.type = 'checkbox'
  core.id = 'core'
  var coreLabel = doc.createElement('label')
  coreLabel.appendChild(core)
  coreLabel.appendChild(doc.createTextNode('core   '))

  var typeEls = {
    v8: {input: v8, label: v8Label},
    regexp: {input: regexp, label: regexpLabel},
    nativeC: {input: nativeC, label: nativeCLabel},
    nativeJS: {input: nativeJS, label: nativeJSLabel},
    core: {input: core, label: coreLabel},
    deps: {input: deps, label: depsLabel},
    app: {input: app, label: appLabel}
  }

  Object.keys(typeEls).forEach(function (t) {
    var el = typeEls[t]
    el.label.style.display = 'inline-block'
    el.label.style.cursor = 'pointer'
    if (!~exclude.indexOf(t)) el.input.checked = true
  })

  function showTiersKey () {
    Object.keys(typeEls).forEach(function (t) {
      var el = typeEls[t]
      var col = flamegraph.colors[t]
      el.label.style.background = 'rgba(' +
        hsl(col.h, col.s / 100 * 1.2, col.l / 100 * 1.2) +
        ', 1)'
    })
    types.style.color = 'black'
  }

  function showLangsKey () {
    var c = flamegraph.colors.c
    c = 'rgba(' +
      hsl(c.h, c.s / 100 * 1.2, c.l / 100 * 1.2) +
      ', 1)'

    ;['v8', 'regexp', 'nativeC'].forEach(function (t) {
      var el = typeEls[t]
      el.label.style.background = c
    })

    var js = flamegraph.colors.js
    js = 'rgba(' +
      hsl(js.h, js.s / 100 * 1.2, js.l / 100 * 1.2) +
      ', 1)'

    ;['app', 'deps', 'core', 'nativeJS'].forEach(function (t) {
      var el = typeEls[t]
      el.label.style.background = js
    })

    types.style.color = 'black'
  }

  function hideKey () {
    Object.keys(typeEls).forEach(function (t) {
      var el = typeEls[t]
      el.label.style.background = 'none'
      types.style.color = bg === 'black' ? 'white' : 'black'
    })
  }

  if (tiersMode) showTiersKey()
  if (langsMode) showLangsKey()

  v8.addEventListener('change', function () {
    if (v8.checked) return flamegraph.typeShow('v8')
    flamegraph.typeHide('v8')
  })
  regexp.addEventListener('change', function () {
    if (regexp.checked) return flamegraph.typeShow('regexp')
    flamegraph.typeHide('regexp')
  })
  nativeC.addEventListener('change', function () {
    if (nativeC.checked) return flamegraph.typeShow('nativeC')
    flamegraph.typeHide('nativeC')
  })
  nativeJS.addEventListener('change', function () {
    if (nativeJS.checked) return flamegraph.typeShow('nativeJS')
    flamegraph.typeHide('nativeJS')
  })
  core.addEventListener('change', function () {
    if (core.checked) return flamegraph.typeShow('core')
    flamegraph.typeHide('core')
  })
  deps.addEventListener('change', function () {
    if (deps.checked) return flamegraph.typeShow('deps')
    flamegraph.typeHide('deps')
  })
  app.addEventListener('change', function () {
    if (app.checked) return flamegraph.typeShow('app')
    flamegraph.typeHide('app')
  })

  search.placeholder = search.type = 'search  '
  theme.innerHTML = 'Theme'
  theme.style.position = 'absolute'
  theme.style.bottom = 0
  theme.style.left = '30px'

  langs.innerHTML = (langsMode ? '−' : '+') + ' Langs'
  langs.style.position = 'absolute'
  langs.style.bottom = 0
  langs.style.left = '86px'

  tiers.innerHTML = (tiersMode ? '−' : '+') + ' Tiers'
  tiers.style.position = 'absolute'
  tiers.style.bottom = 0
  tiers.style.left = '146px'

  optd.innerHTML = (optdMode ? '−' : '+') + ' Optimized'
  optd.style.position = 'absolute'
  optd.style.bottom = 0
  optd.style.left = '201'

  notOptd.innerHTML = (notOptdMode ? '−' : '+') + ' Not Optimized'
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

  style.innerHTML = 'body {padding-left: 2%; background:' + bg + '}'
  style.innerHTML += 'rect:hover {opacity: 0.9}'

  doc.body.style.transition = 'background 500ms ease-in-out'
  doc.body.style.background = bg
  theme.addEventListener('click', function () {
    bg = doc.body.style.background = bg === 'black' ? 'white' : 'black'
    types.style.color = (bg === 'black' ? 'white' : 'black')
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
    zoom -= 0.3
    if (zoom < 0.1) zoom = 0.1
    svg.style.transform = 'scale(' + zoom + ')'
  })
  zoomin.addEventListener('click', function () {
    zoom += 0.3
    if (zoom > 1) zoom = 1
    svg.style.transform = 'scale(' + zoom + ')'
  })

  langs.addEventListener('click', function () {
    langsMode = !langsMode
    flamegraph.langs(langsMode)
    langs.innerHTML = (langsMode ? '−' : '+') + ' Langs'
    if (langsMode) {
      tiersMode = false
      tiers.innerHTML = (tiersMode ? '−' : '+') + ' Tiers'
    }

    if (tiersMode) showTiersKey()
    else if (langsMode) showLangsKey()
    else hideKey()
  })

  tiers.addEventListener('click', function () {
    tiersMode = !tiersMode
    flamegraph.tiers(tiersMode)
    tiers.innerHTML = (tiersMode ? '−' : '+') + ' Tiers'
    if (tiersMode) {
      langsMode = false
      langs.innerHTML = (langsMode ? '−' : '+') + ' Langs'
    }

    if (tiersMode) showTiersKey()
    else if (langsMode) showLangsKey()
    else hideKey()
  })

  optd.addEventListener('click', function () {
    optdMode = !optdMode
    optd.innerHTML = (optdMode ? '−' : '+') + ' Optimized'
    if (!optdMode) return flamegraph.clear('yellow')
    flamegraph.search('\\*', 'yellow')
  })
  notOptd.addEventListener('click', function () {
    notOptdMode = !notOptdMode
    notOptd.innerHTML = (notOptdMode ? '−' : '+') + ' Not Optimized'
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

  var types = doc.createElement('div')
  types.style = 'position: absolute; bottom: 0; right: 30px; color: ' + (bg === 'black' ? 'white' : 'black')

  types.appendChild(appLabel)
  types.appendChild(depsLabel)
  types.appendChild(coreLabel)
  types.appendChild(nativeJSLabel)
  types.appendChild(nativeCLabel)
  types.appendChild(regexpLabel)
  types.appendChild(v8Label)
  doc.body.appendChild(types)

  var meta

  chart.style = 'padding-left: 5%;padding-right:5%;display: block;overflow-y: scroll;overflow-x:hidden;height: 90%;'

  if (!browser) {
    meta = doc.createElement('meta')
    meta.setAttribute('charset', 'utf-8')
    doc.body.insertBefore(meta, doc.body.firstChild)
  }

  if (browser || opts.svg) {
    d3.select(chart).datum(stacks).call(flamegraph)
    var svg = chart.querySelector('svg')
    svg.style.transition = 'transform 200ms ease-in-out'
  }

  if (opts.title) {
    var head = doc.createElement('h1')
    head.innerHTML = opts.title
    head.style.color = '#444'
    doc.body.insertBefore(head, doc.body.firstChild)
  }

  if (!browser) {
    var fs = require('f' + 's')

    if (opts.name === '-') {
      process.stdout.write(doc.body.innerHTML + '<scr' + 'ipt>' + opts.script + '</scr' + 'ipt>')
    } else {
      fs.writeFileSync(dir + '/' + opts.name + '.html',
        doc.body.innerHTML + '<scr' + 'ipt>' + opts.script + '</scr' + 'ipt>')
    }

    if (opts.svg) {
      svg.setAttribute('width', +svg.getAttribute('width') * 2)
      svg.setAttribute('xmlns:dc', 'http://purl.org/dc/elements/1.1/')
      svg.setAttribute('xmlns:cc', 'http://creativecommons.org/ns#')
      svg.setAttribute('xmlns:rdf', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#')
      svg.setAttribute('xmlns:svg', 'http://www.w3.org/2000/svg')
      svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
      svg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink')
      svg.setAttribute('version', '1.0')
      next = next || function () {}
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

function diameter (stacks) {
  var tree = d3.layout.tree()
  var deepest = 0
  tree.nodes(stacks).forEach(function (d) {
    if (d.depth > deepest) deepest = d.depth
  })
  return deepest + 1
}
