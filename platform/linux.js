'use strict'
const fs = require('fs')
const path = require('path')
const spawn = require('child_process').spawn
const pump = require('pump')
const split = require('split2')
const debug = require('debug')('0x')

const {
  getProfileFolderName,
  ensureDirExists,
  stackLine,
  stacksToFlamegraphStream,
  tidy,
  pathTo,
  notFound
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
  var traceInfo = args['trace-info']
  var stacksOnly = args['stacks-only']
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
    '--perf-basic-prof',
    '-r', path.join(__dirname, '..', 'lib', 'soft-exit')
  ].filter(Boolean).concat(args.script), {
    stdio: 'inherit'
  }).on('exit', function (code) {
    if (code !== null && code !== 0 && code !== 143 && code !== 130) {
      tidy(args)
      const err = Error('tracing subprocess error, code: ' + code)
      err.code = code
      ee.emit('error', err, code)
      return
    }
    analyze(true)
  })

  var folder = getProfileFolderName(args, proc)
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
      status('Caught SIGINT, generating flamegraph ')
    }

    proc.on('exit', function () {
      var stacks = spawn('sudo', ['perf', 'script', '-i', perfdat])

      if (traceInfo) { stacks.stderr.pipe(process.stderr) }
      var stacksOut = stackLine(stacks, delay)
      pump(
        stacksOut,
        stacksOnly === '-'
          ? process.stdout
          : fs.createWriteStream(folder + '/stacks.' + proc.pid + '.out')
      )
      if (stacksOnly) {
        return stacks.on('exit', function () {
          log('\u001b[K\n')
          log('\n')
          tidy(args)
          ee.emit('done')
        })
      }
      stacks.on('exit', function () {
        pump(
          fs.createReadStream(folder + '/stacks.' + proc.pid + '.out'),
          stacksToFlamegraphStream(args, {pid: proc.pid, folder}, null, () => status(''))
        )
      })
    })

    spawn('sudo', ['kill', '-SIGINT', '' + proc.pid], {
      stdio: 'inherit'
    })
  }
}
