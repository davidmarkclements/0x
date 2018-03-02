'use strict'
const fs = require('fs')
const path = require('path')
const spawn = require('child_process').spawn
const pumpify = require('pumpify')
const split = require('split2')
const through = require('through2')
const { promisify } = require('util')
const debug = require('debug')('0x')
const v8LogToTickStacks = require('../lib/v8-log-to-tick-stacks')

const {
  determineOutputDir,
  ensureDirExists,
  stacksToFlamegraphStream,
  tidy,
  pathTo
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
    status('Caught SIGINT, generating flamegraph\n')
    try { process.kill(proc.pid, 'SIGINT') } catch (e) {}
    await new Promise((resolve) => proc.on('exit', resolve))
  } else {
    status('Process exited, generating flamegraph\n')
  }

  debug('moving isolate file into folder')
  const isolateLog = fs.readdirSync(args.workingDir).find(function (f) {
    return new RegExp(`isolate-(0x[0-9A-Fa-f]{2,12})-${proc.pid}-v8.log`).test(f)
  })

  if (!isolateLog) throw Error('no isolate logfile found')

  const isolateLogPath = path.join(folder, isolateLog)

  fs.renameSync(path.join(args.workingDir, isolateLog), isolateLogPath)

  return {
    stacks: v8LogToTickStacks(isolateLogPath),
    pid: proc.pid,
    folder: folder
  }
}