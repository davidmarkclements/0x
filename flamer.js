var hsl = require('hsl-to-rgb-for-reals')

function flameGraph () {

  var w = 960, // graph width
    h = 1024, // graph height
    c = 18, // cell height
    selection = null, // selection
    transitionDuration = 500,
    transitionEase = 'cubic-in-out', // tooltip offset
    sort = true,
    langs = false,
    tiers = false,
    allSamples

  function setDetails(t) {
    var details = document.getElementById('details')
    if (details) details.innerHTML = t
  }

  var labelRx = /^LazyCompile:|Function:|Script:/
  var optRx = /^\w+:(\s+)?\*/
  var notOptRx = /^\w+:(\s+)?~/

  function label (d) {
    if (d.dummy) return ''  
    var optInfo = d.optimized && '—opt\'d—' || 
      d.notOptimized && '—not opt\'d—' || ''

    var onStack = d.name ? d3.round(100 * (d.value / allSamples), 1) + '% on stack' : ''
    var topOfStack = d.name ?  (d.top ? 
      d3.round(100 * (d.top / allSamples), 2) + '% stack top' :
      '') : ''

    if (onStack && topOfStack) { onStack += ', ' }

    var name = d.name.replace(labelRx, '') + 
      '<small>' + ' ' + optInfo + ' ' + onStack + ' ' + topOfStack + '</small>'

    return name
  }

  function titleLabel (d) {
    return d.name + '\n' +
    (d.top ?
      'Top of Stack:' + d3.round(100 * (d.top / allSamples), 1) + '% ' +
      '(' + d.top + ' of ' + allSamples + ' samples)\n' : ''
    ) +
    'On Stack:' + d3.round(100 * (d.value / allSamples), 1) + '% ' +
    '(' + d.value + ' of ' + allSamples + ' samples)'
  }

  function langtier(name) {
    //todo: C deps
    if (!/.js/.test(name)) {

      switch(true) {
        case /^Builtin:|^Stub:|v8::|^Keyed(.+)IC:/
          .test(name): return {type: 'v8', lang: 'c'}
        case /^RegExp:/
          .test(name): return {type: 'regexp', lang: 'c'}
        case /^lib|uv_|SSL_|\$|0x5$/
          .test(name): return {type: 'nativeC', lang: 'c'}
        default: return {type: 'nativeJS', lang: 'js'}
      }
      return
    }

    switch(true) {
      case / native /.test(name): return {type: 'nativeJS', lang: 'js'}
      case (name.split(':')[1]||'')
        .replace(/(~|\*)?(\s+)?/, '')[0] !== '/': return {type: 'core', lang: 'js'}
      case !/node_modules/.test(name): return {type: 'app', lang: 'js'}
      default: return {type: 'dep', lang: 'js'}
    }

  }

  var colors = {
    v8: {h: 67, s: 81, l: 65},
    regexp: {h: 310, s: 86, l: 18},
    nativeC: {h: 0, s: 50, l: 50},
    nativeJS: {h: 122, s: 50, l: 45},
    core: {h: 23, s: 66, l: 45},
    dep: {h: 244, s: 50, l: 65},
    app: {h: 200, s: 50, l: 45},
  }
  colors.def = colors.core
  colors.js = colors.core
  colors.c = colors.dep


  function colorHash (d, perc) {
    if (!d.name) {
      return perc ? 'rgb(127, 127, 127)' : 'rgba(0, 0, 0, 0)'
    }

    perc = perc || 1
    var type = d.type || 'def'
    var lang = d.lang || 'js'

    var key

    if (!langs && !tiers) key = colors.def

    if (langs) key = colors[lang]
    if (tiers) key = colors[type]

    var h = key.h
    var s = key.s
    var l = key.l
    var vector = ((d.top / allSamples) * 100) + 1

    s *= vector
    l += (vector * 2)

    s /= 100
    l /= 100

    s *= perc
    l *= perc

    return 'rgba(' + hsl(h, s, l) + ', 0.8)'
  }

  function augment (data) {
    // Augment partitioning layout with "dummy" nodes so that internal nodes'
    // values dictate their width. Annoying, but seems to be least painful
    // option.  https://github.com/mbostock/d3/pull/574
    if (data.children && (data.children.length > 0)) {
      data.children.forEach(augment)
      var childValues = 0
      data.children.forEach(function (child) {
        var lt = langtier(child.name)
        child.type = lt.type
        child.lang = lt.lang
        if (optRx.test(child.name)) {
          child.optimized = true
        }
        if (notOptRx.test(child.name)) {
          child.notOptimized = true
        }
        childValues += child.value
      })
      if (childValues < data.value) {
        data.children.push(
          {
            name: '',
            value: data.value - childValues,
            top: 0,
            dummy: true
          }
        )
      }
    }
  }

  function hide (d) {
    if (!d.original) {
      d.original = d.value
    }
    d.value = 0
    if (d.children) {
      d.children.forEach(hide)
    }
  }

  function show (d) {
    d.fade = false
    if (d.original) {
      d.value = d.original
    }
    if (d.children) {
      d.children.forEach(show)
    }
  }

  function getSiblings (d) {
    var siblings = []
    if (d.parent) {
      var me = d.parent.children.indexOf(d)
      siblings = d.parent.children.slice(0)
      siblings.splice(me, 1)
    }
    return siblings
  }

  function hideSiblings (d) {
    var siblings = getSiblings(d)
    siblings.forEach(function (s) {
      hide(s)
    })
    if (d.parent) {
      hideSiblings(d.parent)
    }
  }

  function fadeAncestors (d) {
    if (d.parent) {
      d.parent.fade = true
      fadeAncestors(d.parent)
    }
  }

  function getRoot (d) {
    if (d.parent) {
      return getRoot(d.parent)
    }
    return d
  }

  function zoom (d) {
    hideSiblings(d)
    show(d)
    fadeAncestors(d)
    update()
  }

  function searchTree (d, term, color) {
    var re = new RegExp(term),
      label = d.name

    if (d.children) {
      d.children.forEach(function (child) {
        searchTree(child, term, color)
      })
    }

    if (label.match(re)) {
      d.highlight = color || true
    } else {
      if (typeof d.highlight === 'boolean')
        d.highlight = false
    }
  }

  function clear (d, color) {
    if (color && d.highlight === color) d.highlight = false
    if (!color) d.highlight = false

    if (d.children) {
      d.children.forEach(function (child) {
        clear(child, color)
      })
    }
  }

  function doSort (a, b) {
    if (typeof sort === 'function') {
      return sort(a, b)
    } else if (sort) {
      return d3.ascending(a.name, b.name)
    } else {
      return 0
    }
  }

  var partition = d3.layout.partition()
    .sort(doSort)
    .value(function (d) { return d.v || d.value; })
    .children(function (d) { return d.c || d.children; })

  function update () {

    selection.each(function (data) {
      var x = d3.scale.linear().range([0, w]),
        y = d3.scale.linear().range([0, c])

      var nodes = partition(data)

      var kx = w / data.dx
      var svg = d3.select(this).select('svg')
      var g = svg.selectAll('g').data(nodes)

      g.transition()
        .duration(transitionDuration)
        .ease(transitionEase)
        .attr('transform', function (d) { return 'translate(' + x(d.x) + ',' + (h - (d.depth * c) - c) + ')'; })

      g.select('rect').transition()
        .duration(transitionDuration)
        .ease(transitionEase)
        .attr('width', function (d) { return d.dx * kx; })

      var node = g.enter()
        .append('svg:g')
        .attr('transform', function (d) { return 'translate(' + x(d.x) + ',' + (h - (d.depth * c) - c) + ')'; })

      node.append('svg:rect')
        .attr('width', function (d) { return d.dx * kx; })

      node.append('svg:title')

      node.append('foreignObject')
        .append('xhtml:div')

      g.attr('width', function (d) { return d.dx * kx; })
        .attr('height', function (d) { return c; })
        .attr('name', function (d) { return d.name; })
        .attr('class', function (d) { return d.fade ? 'frame fade' : 'frame'; })

      g.select('rect')
        .attr('height', function (d) { return c; })
        .style('cursor', 'pointer')
        .style('stroke', function (d) {
          return colorHash(d, 1.1)
        })
        .attr('fill', function (d) {
          var highlightColor = '#E600E6'

          if (typeof d.highlight === 'string')
            highlightColor = d.highlight

          return d.highlight ? highlightColor : colorHash(d)
        })
        .style('visibility', function (d) {return d.dummy ? 'hidden' : 'visible';})

      g.select('title')
        .text(titleLabel)

      g.select('foreignObject')
        .attr('width', function (d) { return d.dx * kx; })
        .attr('height', function (d) { return c; })
        .select('div')
        .style('display', function (d) { return (d.dx * kx < 35) || d.dummy ? 'none' : 'block';})
        .style('pointer-events', 'none')
        .style('white-space', 'nowrap')
        .style('text-overflow', 'ellipsis')
        .style('overflow', 'hidden')
        .style('font-size', '12px')
        .style('font-family', 'Verdana')
        .style('margin-left', '4px')
        .style('margin-right', '4px')
        .style('line-height', '1.5')
        .style('padding', '0')
        .style('font-weight', '400')
        .style('color', '#000')
        .style('text-align', 'left')
        .html(label)

      g.on('click', zoom)

      g.exit().remove()
    })
  }

  function chart (s) {
    selection = s

    if (!arguments.length) return chart

    selection.each(function (data) {
      allSamples = data.value

      var svg = d3.select(this)
        .append('svg:svg')
        .attr('width', w)
        .attr('height', h)
        .attr('class', 'partition d3-flame-graph')

      augment(data)

      // "creative" fix for node ordering when partition is called for the first time
      partition(data)

      // first draw
      update()

    })
  }

  chart.height = function (_) {
    if (!arguments.length) { return h; }
    h = _
    return chart
  }

  chart.width = function (_) {
    if (!arguments.length) { return w; }
    w = _
    return chart
  }

  chart.cellHeight = function (_) {
    if (!arguments.length) { return c; }
    c = _
    return chart
  }

  chart.transitionDuration = function (_) {
    if (!arguments.length) { return transitionDuration; }
    transitionDuration = _
    return chart
  }

  chart.transitionEase = function (_) {
    if (!arguments.length) { return transitionEase; }
    transitionEase = _
    return chart
  }

  chart.sort = function (_) {
    if (!arguments.length) { return sort; }
    sort = _
    return chart
  }

  chart.langs = function (_) {
    if (_ === true) tiers = false
    langs = _
    if (selection) update()
    return chart
  }

  chart.tiers = function (_) {
    if (_ === true) langs = false
    tiers = _
    if (selection) update()
    return chart
  }

  chart.search = function (term, color) {
    selection.each(function (data) {
      searchTree(data, term, color)
      update()
    })
  }

  chart.clear = function (color) {
    selection.each(function (data) {
      clear(data, color)
      update()
    })
  }

  chart.colors = colors

  return chart
}

module.exports = flameGraph