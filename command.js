var fs = require('fs')
var minimist = require('minimist')
var bstr = require('browserify-string')
var split = require('split2')
var convert = require('./stack-convert')
var gen = require('./gen')
var debug = require('debug')('0x:cmd')

module.exports = function (argv) {
  var args = minimist(argv)
  var cmd = args.c || args.cmd

  if (cmd === 'help') {
    return fs.createReadStream('./command-usage.txt')
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

      bstr('require("' + __dirname + '/gen")(' + JSON.stringify(json) + ', ' + opts + ')', {})
        .bundle(function (err, src) {
          if (err) {
            debug(
              'Unable to generate client side code for flamegraph',
              err
            )
          }

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
        })
    }))
}
