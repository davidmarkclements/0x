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

module.exports = v8

function v8 (args, binary) {
  const { log, status, ee } = args

  var node = !binary || binary === 'node' ? pathTo(args, 'node') : binary
  var delay = args.delay
  delay = parseInt(delay, 10)
  if (isNaN(delay)) { delay = 0 }

  var proc = spawn(node, [
    '--prof', 
    `--logfile=%p-v8.log`,
    '-r', path.join(__dirname, '..', 'lib', 'soft-exit')
  ].filter(Boolean).concat(args.argv), {
    stdio: ['ignore', 'inherit', 'inherit']
  }).on('exit', function (code) {
    if (code !== 0) {
      tidy(args)
      const err = Error('0x Target subprocess error, code: ' + code)
      err.code = code
      ee.emit('error', err, code)
      return
    }
    analyze(true)
  })

  var folder = determineOutputDir(args, proc)
  ensureDirExists(folder)

  setTimeout(status, delay || 0, 'Profiling')

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

    try { process.kill(proc.pid, 'SIGINT') } catch (e) {}

    function generate () {
      v8ProfFlamegraph(args, {pid: proc.pid, folder}, next)

      function next() {
        if (delay > 0) {
          pump(
            fs.createReadStream(folder + '/stacks.' + proc.pid + '.out'),
            split(),
            filterBeforeDelay(delay),
            stacksToFlamegraphStream(args, {pid: proc.pid, folder}, null, () => status(''))
          )
        } else {
          pump(
            fs.createReadStream(folder + '/stacks.' + proc.pid + '.out'),
            stacksToFlamegraphStream(args, {pid: proc.pid, folder}, null, () => status(''))
          )
        }
      }
    }
  }
}

function filterBeforeDelay (delay) {
  delay *= 1000 // ms -> ns
  var start
  var pastDelay = false

  return through(function (line, enc, cb) {
    var diff
    line += ''
    if (/cpu-clock:/.test(line)) {
      if (!start) {
        start = parseInt(parseFloat(line.match(/[0-9]+[0-9]+:/)[0], 10), 10)
      } else {
        diff = parseInt(parseFloat(line.match(/[0-9]+[0-9]+:/)[0], 10), 10) - start
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