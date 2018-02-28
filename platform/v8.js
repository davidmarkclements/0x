'use strict'
const fs = require('fs')
const path = require('path')
const spawn = require('child_process').spawn
const pumpify = require('pumpify')
const split = require('split2')
const through = require('through2')
const { promisify } = require('util')
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

async function v8 (args, binary) {
  const { status } = args

  var node = !binary || binary === 'node' ? await pathTo('node') : binary
  var delay = args.delay
  delay = parseInt(delay, 10)
  if (isNaN(delay)) { delay = 0 }

  var proc = spawn(node, [
    '--prof', 
    `--logfile=%p-v8.log`,
    '-r', path.join(__dirname, '..', 'lib', 'soft-exit')
  ].filter(Boolean).concat(args.argv), {
    stdio: ['ignore', 'inherit', 'inherit']
  })
  // timeout merely for effect
  setTimeout(status, delay || 0, 'Profiling')
  
  const { code, manual } = await Promise.race([
    new Promise((resolve) => process.once('SIGINT', () => resolve({code: 0, manual: true}))),
    new Promise((resolve) => proc.once('exit', (code) => resolve({code, manual: false})))
  ])

  if (code !== 0) {
    tidy(args)
    const err = Error('0x Target subprocess error, code: ' + code)
    err.code = code
    throw err
  }

  var folder = determineOutputDir(args, proc)
  ensureDirExists(folder)

  if (process.stdin.isPaused()) {
    process.stdin.resume()
    process.stdin.write('\u001b[?25l')
  }

  if (!manual) {
    status('Caught SIGINT, generating flamegraph')
    try { process.kill(proc.pid, 'SIGINT') } catch (e) {}
    await new Promise((resolve) => proc.on('exit', resolve))
  } else {
    status('Process exited, generating flamegraph')
  }
  await v8ProfFlamegraph(args, {pid: proc.pid, folder})

  return {
    stream : (delay > 0) ? 
      pumpify(
        fs.createReadStream(folder + '/stacks.' + proc.pid + '.out'),
        split(),
        filterBeforeDelay(delay),
      ) : 
      fs.createReadStream(folder + '/stacks.' + proc.pid + '.out'),
    pid: proc.pid,
    folder: folder
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