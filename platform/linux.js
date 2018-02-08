'use strict'
const fs = require('fs')
const path = require('path')
const spawn = require('child_process').spawn
const pump = require('pump')
const split = require('split2')
const through = require('through2')
const debug = require('debug')('0x')

const {
  determineOutputDir,
  ensureDirExists,
  stacksToFlamegraphStream,
  tidy,
  pathTo,
  notFound,
  v8ProfFlamegraph
} = require('../lib/util')

module.exports = linux

function linux (args, sudo, binary) {
  const { log, status, ee } = args
  var perf = pathTo(args, 'perf')
  if (!perf) return notFound(args, 'perf')

  if (!sudo) {
    log('0x captures stacks using perf, which requires sudo access\n')
    return spawn('sudo', ['true'])
      .on('exit', function () { linux(args, true, binary) })
  }

  var node = !binary || binary === 'node' ? pathTo(args, 'node') : binary
  var uid = parseInt(Math.random() * 1e9, 10).toString(36)
  var perfdat = '/tmp/perf-' + uid + '.data'
  var traceInfo = args.traceInfo
  var delay = args.delay || args.d
  delay = parseInt(delay, 10)
  if (isNaN(delay)) { delay = 0 }

  var proc = spawn('sudo', [
    '-E',
    'perf',
    'record',
    !traceInfo ? '-q' : '',
    '-e',
    'cpu-clock',
    '-F 1000', // 1000 samples per sec === 1ms profiling like dtrace
    '-g',
    '-o',
    perfdat,
    '--',
    node,
    ...(args.profViz ? ['--prof', `--logfile=${uid}-v8.log`] : []),
    '--perf-basic-prof',
    '-r', path.join(__dirname, '..', 'lib', 'soft-exit')
  ].filter(Boolean).concat(args.argv), {
    stdio: ['ignore', 'inherit', 'inherit']
  }).on('exit', function (code) {
    if (code !== null && code !== 0 && code !== 143 && code !== 130) {
      tidy(args)
      const err = Error('0x: Tracing subprocess error, code: ' + code)
      err.code = code
      ee.emit('error', err, code)
      return
    }
    analyze(true)
  })

  var folder = determineOutputDir(args, proc)
  ensureDirExists(folder)

  setTimeout(status, delay || 100, 'Profiling')

  if (process.stdin.isPaused()) {
    process.stdin.resume()
    log('\u001b[?25l')
  }

  process.once('SIGINT', analyze)

  function analyze (manual) {
    if (analyze.called) { return }
    analyze.called = true

    if (!manual) {
      debug('Caught SIGINT, generating flamegraph')
      status('Caught SIGINT, generating flamegraph')
      proc.on('exit', generate)
    } else {
      debug('Process exited, generating flamegraph')
      status('Process exited, generating flamegraph')
      generate()
    }

    function generate () {
      if (args.profViz) v8ProfFlamegraph(args, {pid: uid, folder}, next)
      else next()

      function next() {
        
        var stacks = spawn('sudo', ['perf', 'script', '-i', perfdat], {
          stdio: [
            'ignore', 
            fs.openSync(folder + '/stacks.' + proc.pid + '.out', 'w'),
            traceInfo ? process.stderr : 'ignore'
          ]
        })

        stacks.on('exit', function () {
          if (delay > 0) {
            pump(
              fs.createReadStream(folder + '/stacks.' + proc.pid + '.out'),
              filterBeforeDelay(delay),
              stacksToFlamegraphStream(args, {pid: proc.pid, folder}, null, () => status(''))
            )
          } else {
            pump(
              fs.createReadStream(folder + '/stacks.' + proc.pid + '.out'),
              stacksToFlamegraphStream(args, {pid: proc.pid, folder}, null, () => status(''))
            )
          }
        })
      }
    }

    spawn('sudo', ['kill', '-SIGINT', '' + proc.pid], {
      stdio: 'inherit'
    })
  }
}


function filterBeforeDelay (delay) {
  var start
  var pastDelay

  return through(function (line, enc, cb) {
    var diff
    line += ''
    if (/cpu-clock:/.test(line)) {
      if (!start) {
        start = parseInt(parseFloat(line.match(/[0-9]+\.[0-9]+:/)[0], 10) * 1000, 10)
      } else {
        diff = parseInt(parseFloat(line.match(/[0-9]+\.[0-9]+:/)[0], 10) * 1000, 10) - start
        pastDelay = (diff > delay)
      }
    }
    if (pastDelay) {
      cb(null, line + '\n')
    } else {
      cb()
    }
  })
}