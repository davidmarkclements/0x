'use strict'
const fs = require('fs')
const path = require('path')
const spawn = require('child_process').spawn
const pump = require('pump')
const split = require('split2')
const through = require('through2')
const debug = require('debug')('0x')
const traceStacksToTicks = require('../lib/trace-stacks-to-ticks')
const { promisify } = require('util')

const {
  determineOutputDir,
  ensureDirExists,
  tidy,
  pathTo
} = require('../lib/util')

module.exports = promisify(linux)

function linux (args, sudo, binary, cb) {
  const { status } = args
  var perf = pathTo('perf')
  if (!perf) return void cb(Error('0x: Unable to locate dtrace - make sure it\'s in your PATH'))
  if (!sudo) {
    status('0x captures stacks using perf, which requires sudo access\n')
    return spawn('sudo', ['true'])
      .on('exit', function () { linux(args, true, binary, cb) })
  }

  var node = !binary || binary === 'node' ? pathTo('node') : binary
  var uid = parseInt(Math.random() * 1e9, 10).toString(36)
  var perfdat = '/tmp/perf-' + uid + '.data'
  var kernelTracingDebug = args.kernelTracingDebug

  var proc = spawn('sudo', [
    '-E',
    'perf',
    'record',
    !kernelTracingDebug ? '-q' : '',
    '-e',
    'cpu-clock',
    '-F 1000', // 1000 samples per sec === 1ms profiling like dtrace
    '-g',
    '-o',
    perfdat,
    '--',
    node,
    '--perf-basic-prof',
    '-r', path.join(__dirname, '..', 'lib', 'soft-exit')
  ].filter(Boolean).concat(args.argv), {
    stdio: ['ignore', 'inherit', 'inherit']
  }).on('exit', function (code) {
    if (code !== null && code !== 0 && code !== 143 && code !== 130) {
      tidy(args)
      const err = Error('Tracing subprocess error, code: ' + code)
      err.code = code
      cb(Error(err))
      return
    }
    analyze(true)
  })

  var folder = determineOutputDir(args, proc)
  ensureDirExists(folder)

  status('Profiling')

  if (process.stdin.isPaused()) {
    process.stdin.resume()
    process.stdout.write('\u001b[?25l')
  }

  process.once('SIGINT', analyze)

  function analyze (manual) {
    if (analyze.called) { return }
    analyze.called = true

    if (!manual) {
      debug('Caught SIGINT, generating flamegraph')
      status('Caught SIGINT, generating flamegraph\n')
      proc.on('exit', generate)
    } else {
      debug('Process exited, generating flamegraph')
      status('Process exited, generating flamegraph\n')
      generate()
    }

    function generate () {
      var stacks = spawn('sudo', ['perf', 'script', '-i', perfdat], {
        stdio: [
          'ignore', 
          fs.openSync(folder + '/stacks.' + proc.pid + '.out', 'w'),
          kernelTracingDebug ? process.stderr : 'ignore'
        ]
      })

      stacks.on('exit', function () {
        cb(null, {
          ticks: traceStacksToTicks(folder + '/stacks.' + proc.pid + '.out'),
          pid: proc.pid,
          folder: folder
        })
      })
    }

    spawn('sudo', ['kill', '-SIGINT', '' + proc.pid], {
      stdio: 'inherit'
    })
  }
}
