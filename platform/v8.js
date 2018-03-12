'use strict'
const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')
const pumpify = require('pumpify')
const pump = require('pump')
const split = require('split2')
const through = require('through2')
const debug = require('debug')('0x')

const v8LogToTicks = require('../lib/v8-log-to-ticks')

const {
  determineOutputDir,
  ensureDirExists,
  tidy,
  pathTo
} = require('../lib/util')

module.exports = v8

async function v8 (args, binary) {
  const { status } = args

  var node = !binary || binary === 'node' ? await pathTo('node') : binary

  var proc = spawn(node, [
    '--prof',
    `--logfile=%p-v8.log`,
    '--print-opt-source',
    '-r', path.join(__dirname, '..', 'lib', 'instrument'),
    '-r', path.join(__dirname, '..', 'lib', 'soft-exit')
  ].filter(Boolean).concat(args.argv), {
    stdio: ['ignore', 'pipe', 'inherit']
  })

  const inlined = collectInliningInfo(proc)
  
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

  status('Process exited, generating flamegraph\n')

  debug('moving isolate file into folder')
  const isolateLog = fs.readdirSync(args.workingDir).find(function (f) {
    return new RegExp(`isolate-(0x[0-9A-Fa-f]{2,12})-${proc.pid}-v8.log`).test(f)
  })

  if (!isolateLog) throw Error('no isolate logfile found')

  const isolateLogPath = path.join(folder, isolateLog)

  fs.renameSync(path.join(args.workingDir, isolateLog), isolateLogPath)

  return {
    ticks: await v8LogToTicks(isolateLogPath),
    inlined: inlined,
    pid: proc.pid,
    folder: folder
  }
}


function collectInliningInfo (sp) {
  const inlined = {}
  var root
  pump(sp.stdout, split(), through((s, _, cb) => {
    s += '\n'
    if (s[0] === '\u0001') { // stdout from user land
      process.stdout.write(s)
      return cb()
    } 
    //trace data
    if (/^(--- FUNCTION SOURCE |INLINE )/.test(s)) {
      const [match, file, fn = '(anonymous)', id, ix, pos] = /\((.+):(.+)?\) id\{(\d+),(-?\d+)\} start\{(\d+)}/.exec(s) || [false]
      if (match === false) return cb()
      if (ix === '-1') root = {file, fn, id, ix, pos, key: `${fn} ${file}`}
      else {
        const key = `${fn} ${file}`
        inlined[key] = inlined[key] || []
        inlined[key].push({file, fn, id, ix, pos, caller: root})
      }
    }
    cb()
  }))
  return inlined
}