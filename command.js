var fs = require('fs')
var path = require('path')
var minimist = require('minimist')
var multistream = require('multistream')
var concat = require('concat-stream')
var browserify = require('browserify')
var split = require('split2')
var convert = require('./stack-convert')
var gen = require('./gen')
var debug = require('debug')('0x:cmd')

module.exports = function (argv) {
  var args = minimist(argv)
  var cmd = args.c || args.cmd

  if (cmd === 'help') {
    return fs.createReadStream(path.join(__dirname, './command-usage.txt'))
      .pipe(process.stdout)
  }

  if (cmd === 'gen') {
    return makeFlameGraph(args)
  }
}

function makeFlameGraph (args) {
  return fs.createReadStream(args._[0])
    .pipe(split())
    .pipe(convert(function (err, json) {
      if (err) { throw err }
      debug('converted stacks to intermediate format')
      var opts = JSON.stringify({
        theme: args.theme,
        title: args.title,
        exclude: args.x || args.exclude
      })
      if (args.langs) opts.langs = args.l || args.langs
      if (args.tiers) opts.tiers = args.t || args.tiers

      multistream([
        browserify({standalone: 'd3'}).add(require.resolve('d3')).bundle(),
        browserify({standalone: 'hsl'}).add(require.resolve('hsl-to-rgb-for-reals')).bundle(),
        browserify({standalone: 'flamer'}).add(path.join(__dirname, './flamer')).bundle(),
        browserify({standalone: 'gen'}).add(path.join(__dirname, './gen')).bundle()
      ]).pipe(concat(function (bundle) {
        write(bundle + '\ngen(' + JSON.stringify(json) + ', ' + opts + ')')
      }))

      function write (src) {
        var opts = {
          name: '-',
          theme: args.theme,
          title: args.title,
          script: src.toString(),
          exclude: args.exclude
        }

        if (args.langs) opts.langs = args.langs
        if (args.tiers) opts.tiers = args.tiers

        gen(json, opts, function () {}, function () {
          debug('flamegraph generated')
          debug('exiting')
          process.exit()
        })
      }
    }))
}
