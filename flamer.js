/* global d3 */
var hsl = require('hsl-to-rgb-for-reals')

function flameGraph () {
  var w = 960 // graph width
  var h = 1024 // graph height
  var c = 18 // cell height
  var selection = null // selection
  var transitionDuration = 500
  var transitionEase = 'cubic-in-out' // tooltip offset
  var sort = true
  var langs = false
  var tiers = false
  var filterNeeded = true
  var filterTypes = []
  var allSamples
  var labelRx = /^LazyCompile:|Function:|Script:/
  var optRx = /^\w+:(\s+)?\*/
  var notOptRx = /^\w+:(\s+)?~/

  function label (d) {
    if (d.dummy) return ''
    var optInfo = d.optimized && '—opt\'d—' ||
      d.notOptimized && '—not opt\'d—' || ''

    var onStack = d.name ? d3.round(100 * (d.value / allSamples), 1) + '% on stack' : ''
    var top = stackTop(d)
    var topOfStack = d.name ? (top
      ? d3.round(100 * (top / allSamples), 2) + '% stack top'
      : '') : ''

    if (onStack && topOfStack) { onStack += ', ' }

    var name = d.name.replace(labelRx, '') +
      '<small>' + ' ' + optInfo + ' ' + onStack + ' ' + topOfStack + '</small>'

    return name
  }

  function stackTop (d) {
    if (!d.children) return d.top
    var top = d.top

    d.children
      .forEach(function (child) {
        if (
            !child.children ||
            child.children.filter(function (c) { return c.hide }).length
        ) {
          if (child.hide) {
            top += stackTop(child)
          }
        }
      })

    return top
  }

  function titleLabel (d) {
    var top = stackTop(d)
    return d.name + '\n' + (top
      ? 'Top of Stack:' + d3.round(100 * (top / allSamples), 1) + '% ' +
      '(' + top + ' of ' + allSamples + ' samples)\n'
      : '') +
    'On Stack:' + d3.round(100 * (d.value / allSamples), 1) + '% ' +
    '(' + d.value + ' of ' + allSamples + ' samples)'
  }

  function langtier (name) {
    // todo: C deps
    if (!/.js/.test(name)) {
      switch (true) {
        case /^Builtin:|^Stub:|v8::|^(.+)IC:|^Handler:/
          .test(name): return {type: 'v8', lang: 'c'}
        case /^RegExp:/
          .test(name): return {type: 'regexp', lang: 'c'}
        case /apply$|call$|Arguments$/
          .test(name): return {type: 'nativeJS', lang: 'js'}
        case /\.$/.test(name): return {type: 'core', lang: 'js'}
        default: return {type: 'nativeC', lang: 'c'}
      }
      return
    }

    switch (true) {
      case / native /.test(name): return {type: 'nativeJS', lang: 'js'}
      case (name.indexOf('/') === -1 || /internal\//.test(name) && !/ \//.test(name)): return {type: 'core', lang: 'js'}
      case !/node_modules/.test(name): return {type: 'app', lang: 'js'}
      default: return {type: 'deps', lang: 'js'}
    }
  }

  var colors = {
    v8: {h: 67, s: 81, l: 65},
    regexp: {h: 310, s: 86, l: 18},
    nativeC: {h: 0, s: 50, l: 50},
    nativeJS: {h: 122, s: 50, l: 45},
    core: {h: 23, s: 66, l: 45},
    deps: {h: 244, s: 50, l: 65},
    app: {h: 200, s: 50, l: 45}
  }
  colors.def = colors.core
  colors.js = colors.core
  colors.c = colors.deps

  var diffScale = d3.scale.linear().range([0, 0.2])

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
    var top = stackTop(d)
    var vector = ((top / allSamples) * 100) + 1
    s *= vector
    l += (vector * 2)

    s /= 100
    l /= 100

    s *= perc
    l *= perc

    var a = 0.8
    if (l > .8) {
      a += diffScale(l - 0.8)
      l = .8
    }

    var rgb = hsl(h, s, l)
    
    return 'rgba(' + rgb + ', ' + a + ')'
  }

  function filter (data) {
    if (!filterNeeded) return
    if (data.children && (data.children.length > 0)) {
      data.children.forEach(filter)
      data.children.forEach(function (child) {
        if (~filterTypes.indexOf(child.type) || ~filterTypes.indexOf(child.lang)) {
          child.hide = true
        } else {
          child.hide = false
        }
      })
    }
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

  function zoom (d) {
    hideSiblings(d)
    show(d)
    fadeAncestors(d)
    update()
  }

  function searchTree (d, term, color) {
    var re = new RegExp(term)
    var label = d.name

    if (d.children) {
      d.children.forEach(function (child) {
        searchTree(child, term, color)
      })
    }
    if (d.hide) { return }
    if (label.match(re)) {
      d.highlight = color || true
    } else {
      if (typeof d.highlight === 'boolean') {
        d.highlight = false
      }
    }
  }

  function clear (d, color) {
    if (color && d.highlight === color) {
      d.highlight = false
    }
    if (!color) { d.highlight = false }
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
    .value(function (d) { return d.v || d.value })
    .children(function (d) { return d.c || d.children })

  function translate (d) {
    var x = d3.scale.linear().range([0, w])
    var parent = d.parent
    var depthOffset = parent && parent.hide ? 1 : 0
    while (parent && (parent = parent.parent)) {
      if (parent.hide) depthOffset += 1
    }
    var depth = d.depth - depthOffset
    return 'translate(' + x(d.x) + ',' + (h - (depth * c) - c) + ')'
  }

  function update () {
    selection
      .each(function (data) {
        filter(data)

        var nodes = partition(data)
        var kx = w / data.dx
        var svg = d3.select(this).select('svg')
        var g = svg.selectAll('g').data(nodes)

        svg.on('click', function (d) {
          if (d3.event.path[0] === this) {
            zoom(d)
          }
        })

        g.transition()
          .duration(transitionDuration)
          .ease(transitionEase)
          .attr('transform', translate)

        g.select('rect').transition()
          .duration(transitionDuration)
          .ease(transitionEase)
          .attr('width', function (d) { return d.dx * kx })

        var node = g.enter()
          .append('svg:g')
          .attr('transform', translate)

        node
          .append('svg:rect')
          .attr('width', function (d) { return d.dx * kx })

        node.append('svg:title')

        node.append('foreignObject')
          .append('xhtml:div')

        node.attr('width', function (d) { return d.dx * kx })
          .attr('height', function (d) { return c })
          .attr('name', function (d) { return d.name })
          .attr('class', function (d) { return d.fade ? 'frame fade' : 'frame' })

        g.select('rect')
          .attr('height', function (d) { return d.hide ? 0 : c })
          .style('cursor', 'pointer')
          .style('stroke', function (d) {
            return colorHash(d, 1.1)
          })
          .attr('fill', function (d) {
            var highlightColor = '#E600E6'

            if (typeof d.highlight === 'string') {
              highlightColor = d.highlight
            }
            return d.highlight ? highlightColor : colorHash(d)
          })
          .style('visibility', function (d) { return d.dummy ? 'hidden' : 'visible' })

        g.select('title')
          .text(titleLabel)

        g.select('foreignObject')
          .transition()
          .duration(transitionDuration)
          .ease(transitionEase)
          .attr('width', function (d) { return d.dx * kx })

        g.select('foreignObject')
          .style('overflow', 'hidden')
          .attr('height', function (d) { return d.hide ? 0 : c })
          .select('div')
          .style('display', function (d) { return (d.dx * kx < 35) || d.dummy ? 'none' : 'block' })
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

        var hidden = g.filter(function (d) { return d.hide })
        hidden.forEach(function (d) {
          hide(d)
        })

        g.exit().remove()
      })
  }

  function chart (s) {
    selection = s

    if (!arguments.length) return chart

    selection.each(function (data) {
      allSamples = data.value

      d3.select(this)
        .append('svg:svg')
        .attr('width', w)
        .attr('height', h)
        .attr('class', 'partition d3-flame-graph')

      augment(data)
      filter(data)
      // "creative" fix for node ordering when partition is called for the first time
      partition(data)

      // first draw
      update()
    })
  }

  chart.height = function (_) {
    if (!arguments.length) { return h }
    h = _
    return chart
  }

  chart.width = function (_) {
    if (!arguments.length) { return w }
    w = _
    return chart
  }

  chart.cellHeight = function (_) {
    if (!arguments.length) { return c }
    c = _
    return chart
  }

  chart.transitionDuration = function (_) {
    if (!arguments.length) { return transitionDuration }
    transitionDuration = _
    return chart
  }

  chart.transitionEase = function (_) {
    if (!arguments.length) { return transitionEase }
    transitionEase = _
    return chart
  }

  chart.sort = function (_) {
    if (!arguments.length) { return sort }
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

  chart.typeHide = function (type) {
    if (!~filterTypes.indexOf(type)) {
      filterTypes.push(type)
      filterNeeded = true
      if (selection) update()
    }
  }

  chart.typeShow = function (type) {
    var ix = filterTypes.indexOf(type)
    if (!~ix) return
    filterTypes.splice(ix, 1)
    filterNeeded = true
    if (selection) update()
  }

  chart.colors = colors

  return chart
}

module.exports = flameGraph
