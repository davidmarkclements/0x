'use strict'
const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')
const pump = require('pump')
const split = require('split2')
const through = require('through2')
const debug = require('debug')('0x')
const v8LogToTicks = require('../lib/v8-log-to-ticks')

const {
  getTargetFolder,
  pathTo,
  spawnOnPort,
  when
} = require('../lib/util')

module.exports = v8

async function v8 (args, binary) {
  const { status, outputDir, workingDir, name, onPort } = args

  var node = !binary || binary === 'node' ? await pathTo('node') : binary
  var proc = spawn(node, [
    '--prof',
    `--logfile=%p-v8.log`,
    '--print-opt-source',
    '-r', path.join(__dirname, '..', 'lib', 'preload', 'mux-stdout'),
    '-r', path.join(__dirname, '..', 'lib', 'preload', 'soft-exit'),
    ...(onPort ? ['-r', path.join(__dirname, '..', 'lib', 'preload', 'detect-port.js')] : [])
  ].concat(args.argv), {
    stdio: ['ignore', 'pipe', 'inherit', 'pipe']
  })

  const inlined = collectInliningInfo(proc)

  if (onPort) status('Profiling\n')
  else status('Profiling')

  const whenPort = onPort && spawnOnPort(onPort, await when(proc.stdio[3], 'data'))

  const code = await Promise.race([
    new Promise((resolve) => process.once('SIGINT', resolve)),
    new Promise((resolve) => proc.once('exit', (code) => resolve(code))),
    ...(onPort ? [new Promise((resolve, reject) => {
      whenPort.then(() => proc.kill('SIGINT'))
      whenPort.catch((err) => {
        proc.kill()
        reject(err)
      })
    })] : [])
  ])

  if (code|0 !== 0) {
    throw Object.assign(Error('Target subprocess error, code: ' + code), { code })
  }

  const folder = getTargetFolder({outputDir, workingDir, name, pid: proc.pid})

  status('Process exited, generating flamegraph')

  debug('moving isolate file into folder')
  const isolateLog = fs.readdirSync(args.workingDir).find(function (f) {
    return new RegExp(`isolate-0(x)?([0-9A-Fa-f]{2,16})-${proc.pid}-v8.log`).test(f)
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
    // trace data
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
