'use strict'

const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')
const pump = require('pump')
const split = require('split2')
const through = require('through2')
const debug = require('debug')('0x')
const v8LogToTicks = require('../lib/v8-log-to-ticks')
const { promisify } = require('util')
const rename = promisify(fs.rename)
const sleep = promisify(setTimeout)

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
    '-r', path.join(__dirname, '..', 'lib', 'preload', 'redir-stdout'),
    '-r', path.join(__dirname, '..', 'lib', 'preload', 'soft-exit'),
    ...(onPort ? ['-r', path.join(__dirname, '..', 'lib', 'preload', 'detect-port.js')] : [])
  ].concat(args.argv), {
    stdio: ['ignore', 'pipe', 'inherit', 'pipe', 'ignore', 'pipe']
  })

  const inlined = collectInliningInfo(proc)

  if (onPort) status('Profiling\n')
  else status('Profiling')

  proc.stdio[3].pipe(process.stdout)

  const whenPort = onPort && spawnOnPort(onPort, await when(proc.stdio[5], 'data'))

  const code = await Promise.race([
    new Promise((resolve) => process.once('SIGINT', resolve)),
    new Promise((resolve) => proc.once('exit', (code) => resolve(code))),
    ...(onPort ? [new Promise((resolve, reject) => {
      whenPort.then(() => proc.stdio[5].destroy())
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
  await renameSafe(path.join(args.workingDir, isolateLog), isolateLogPath)
  return {
    ticks: await v8LogToTicks(isolateLogPath),
    inlined: inlined,
    pid: proc.pid,
    folder: folder
  }
}

async function renameSafe (from, to, tries = 0) {
  try {
    await rename(from, to)
  } catch (e) {
    if (tries > 5) {
      throw e
    }
    await sleep(1000)
    await renameSafe(from, to, tries++)
  }
}

function collectInliningInfo (sp) {
  var root
  var stdoutIsPrintOptSourceOutput = false
  var lastOptimizedFrame = null
  var inlined = {}
  pump(sp.stdout, split(), through((s, _, cb) => {
    s += '\n'

    if (stdoutIsPrintOptSourceOutput === true && /^--- END ---/.test(s)) {
      stdoutIsPrintOptSourceOutput = false
      return cb()
    }
    // trace data
    if (stdoutIsPrintOptSourceOutput === false) {
      if (/INLINE/.test(s)) {
        const [ match, inlinedFn ] = /INLINE \((.*)\)/.exec(s) || [ false ]
        // shouldn't not match though..
        if (match === false) return cb()
        
        if (lastOptimizedFrame === null) return cb() 
        const { fn, file } = lastOptimizedFrame
        // could be a big problem if the fn doesn't match
        if (fn !== inlinedFn) return cb()
        
        const key = `${fn} ${file}`
        inlined[key] = inlined[key] || []
        inlined[key].push(lastOptimizedFrame)
        cb()
        return
      } else if (/^--- FUNCTION SOURCE /.test(s)) {
        stdoutIsPrintOptSourceOutput = true
        const [match, file, fn = '(anonymous)', id, ix, pos] = /\((.+):(.+)?\) id\{(\d+),(-?\d+)\} start\{(\d+)}/.exec(s) || [false]
        if (match === false) return cb()
        if (ix === '-1') root = {file, fn, id, ix, pos, key: `${fn} ${file}`}
        else {
          lastOptimizedFrame = {file, fn, id, ix, pos, caller: root}
        } 
      } else process.stdout.write(s)
    }

    cb()
  }))
  return inlined
}
