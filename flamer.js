(function() {
  'use strict';

  function flameGraph() {

    var w = 960, // graph width
      h = 1024, // graph height
      c = 18, // cell height
      selection = null, // selection
      tooltip = true, // enable tooltip
      title = "", // graph title
      transitionDuration = 500,
      transitionEase = "cubic-in-out", // tooltip offset
      sort = true;


    var labelFormat = function(d) {
      return d.name + " (" + d3.round(100 * d.dx, 3) + "%, " + d.value + " samples)";
    }

    function setDetails(t) {
      var details = document.getElementById("details");
      if (details)
        details.innerHTML = t;
    }

    function label(d) {
      if (!d.dummy) {
        return labelFormat(d);
      } else {
        return "";
      }
    }

    function name(d) {
      return d.name;
    }

    function generateHash(name) {
      // Return a vector (0.0->1.0) that is a hash of the input string.
      // The hash is computed to favor early characters over later ones, so
      // that strings with similar starts have similar vectors. Only the first
      // 6 characters are considered.
      var hash = 0, weight = 1, max_hash = 0, mod = 10, max_char = 6;
      if (name) {
        for (var i = 0; i < name.length; i++) {
          if (i > max_char) { break; }
          hash += weight * (name.charCodeAt(i) % mod);
          max_hash += weight * (mod - 1);
          weight *= 0.70;
        }
        if (max_hash > 0) { hash = hash / max_hash; }
      }
      return hash;
    }

    function colorHash(name, heat) {
      var vector = 0;
      if (name) {
        name = name.replace(/.*`/, "");   // drop module name if present
        name = name.replace(/\(.*/, "");  // drop extra info
        vector = generateHash(name);
      }
      var r = 200 + Math.round(55 * vector);
      var g = 0 + Math.round(230 * (1 - vector));
      var b = 0 + Math.round(55 * (1 - vector));
      var a = heat
      return 'rgb(' + r + ',' + g + ',' + b + ')';
    }

    function augment(data) {
      // Augment partitioning layout with "dummy" nodes so that internal nodes'
      // values dictate their width. Annoying, but seems to be least painful
      // option.  https://github.com/mbostock/d3/pull/574
      if (data.children && (data.children.length > 0)) {
        data.children.forEach(augment);
        var childValues = 0;
        data.children.forEach(function(child) {
          childValues += child.value;
        });
        if (childValues < data.value) {
          data.children.push(
            {
              "name": "",
              "value": data.value - childValues,
              "dummy": true
            }
          );
        }
      }
    }

    function hide(d) {
      if(!d.original) {
        d.original = d.value;
      }
      d.value = 0;
      if(d.children) {
        d.children.forEach(hide);
      }
    }

    function show(d) {
      d.fade = false;
      if(d.original) {
        d.value = d.original;
      }
      if(d.children) {
        d.children.forEach(show);
      }
    }

    function getSiblings(d) {
      var siblings = [];
      if (d.parent) {
        var me = d.parent.children.indexOf(d);
        siblings = d.parent.children.slice(0);
        siblings.splice(me, 1);
      }
      return siblings;
    }

    function hideSiblings(d) {
      var siblings = getSiblings(d);
      siblings.forEach(function(s) {
        hide(s);
      });
      if(d.parent) {
        hideSiblings(d.parent);
      }
    }

    function fadeAncestors(d) {
      if(d.parent) {
        d.parent.fade = true;
        fadeAncestors(d.parent);
      }
    }

    function getRoot(d) {
      if(d.parent) {
        return getRoot(d.parent);
      }
      return d;
    }

    function zoom(d) {
      hideSiblings(d);
      show(d);
      fadeAncestors(d);
      update();
    }

    function searchTree(d, term) {
      var re = new RegExp(term),
          label = d.name;

      if (d.children) {
        d.children.forEach(function(child) {
          searchTree(child, term);
        });
      }

      if (label.match(re)) {
        d.highlight = true;
      } else {
        d.highlight = false;
      }
    }

    function clear(d) {
      d.highlight = false;
      if(d.children) {
        d.children.forEach(function(child) {
          clear(child, term);
        });
      }
    }

    function doSort(a, b) {
      if (typeof sort === 'function') {
        return sort(a, b);
      } else if (sort) {
        return d3.ascending(a.name, b.name);
      } else {
        return 0;
      }
    }

    var partition = d3.layout.partition()
      .sort(doSort)
      .value(function(d) { return d.v || d.value; })
      .children(function(d) { return d.c || d.children; });

    function update() {

      selection.each(function(data) {

        var x = d3.scale.linear().range([0, w]),
            y = d3.scale.linear().range([0, c]);

        var nodes = partition(data);

        var kx = w / data.dx;

        var g = d3.select(this).select("svg").selectAll("g").data(nodes);

        g.transition()
          .duration(transitionDuration)
          .ease(transitionEase)
          .attr("transform", function(d) { return "translate(" + x(d.x) + "," + (h - y(d.depth) - c) + ")"; });

        g.select("rect").transition()
          .duration(transitionDuration)
          .ease(transitionEase)
          .attr("width", function(d) { return d.dx * kx; });

        var node = g.enter()
          .append("svg:g")
          .attr("transform", function(d) { return "translate(" + x(d.x) + "," + (h - y(d.depth) - c) + ")"; });

        node.append("svg:rect")
          .attr("width", function(d) { return d.dx * kx; });

          node.append("svg:title");

        node.append("foreignObject")
          .append("xhtml:div");

        g.attr("width", function(d) { return d.dx * kx; })
          .attr("height", function(d) { return c; })
          .attr("name", function(d) { return d.name; })
          .attr("class", function(d) { return d.fade ? "frame fade" : "frame"; });

        g.select("rect")
          .attr("height", function(d) { return c; })
          .attr("fill", function(d) {return d.highlight ? "#E600E6" : colorHash(d.name,  d.dx); })
          .style("visibility", function(d) {return d.dummy ? "hidden" : "visible";});


          g.select("title")
            .text(label);

        g.select("foreignObject")
          .attr("width", function(d) { return d.dx * kx; })
          .attr("height", function(d) { return c; })
          .select("div")
          .attr("class", "label")
          .style("display", function(d) { return (d.dx * kx < 35) || d.dummy ? "none" : "block";})
          .text(name);

        g.on('click', zoom);

        g.exit().remove();

        g.on('mouseover', function(d) {
          if(!d.dummy) {

            setDetails(label(d));
          }
        }).on('mouseout', function(d) {
          if(!d.dummy) {

            setDetails("");
          }
        });
      });
    }

    function chart(s) {

      selection = s;

      if (!arguments.length) return chart;

      selection.each(function(data) {

        var svg = d3.select(this)
          .append("svg:svg")
          .attr("width", w)
          .attr("height", h)
          .attr("class", "partition d3-flame-graph")


        svg.append("svg:text")
          .attr("class", "title")
          .attr("text-anchor", "middle")
          .attr("y", "25")
          .attr("x", w/2)
          .attr("fill", "#808080")
          .text(title);

        augment(data);

        // "creative" fix for node ordering when partition is called for the first time
        partition(data);

        // first draw
        update();

      });
    }

    chart.height = function (_) {
      if (!arguments.length) { return h; }
      h = _;
      return chart;
    };

    chart.width = function (_) {
      if (!arguments.length) { return w; }
      w = _;
      return chart;
    };

    chart.cellHeight = function (_) {
      if (!arguments.length) { return c; }
      c = _;
      return chart;
    };

    chart.tooltip = function (_) {
      if (!arguments.length) { return tooltip; }

      tooltip = true;
      return chart;
    };

    chart.title = function (_) {
      if (!arguments.length) { return title; }
      title = _;
      return chart;
    };

    chart.transitionDuration = function (_) {
      if (!arguments.length) { return transitionDuration; }
      transitionDuration = _;
      return chart;
    };

    chart.transitionEase = function (_) {
      if (!arguments.length) { return transitionEase; }
      transitionEase = _;
      return chart;
    };

    chart.sort = function (_) {
      if (!arguments.length) { return sort; }
      sort = _;
      return chart;
    };

    chart.label = function(_) {
      if (!arguments.length) { return labelFormat; }
      labelFormat = _;
      return chart;
    }

    chart.search = function(term) {
      selection.each(function(data) {
        searchTree(data, term);
        update();
      });
    };

    chart.clear = function() {
      selection.each(function(data) {
        clear(data);
        update();
      });
    };

    return chart;
  }

  if (typeof module !== 'undefined' && module.exports){
    module.exports = flameGraph;
  }
  else {
    d3.flameGraph = flameGraph;
  }
})();
