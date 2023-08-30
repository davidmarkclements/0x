'use strict'

const fs = require('fs-extra')
const path = require('path')
const { spawn } = require('child_process')
const pump = require('pump')
const split = require('split2')
const through = require('through2')
const debug = require('debug')('0x')
const v8LogToTicks = require('../lib/v8-log-to-ticks')
const { promisify } = require('util')
const sleep = promisify(setTimeout)

const {
  getTargetFolder,
  spawnOnPort,
  when
} = require('../lib/util')

module.exports = v8

const SOFT_EXIT_SIGNALS = ['SIGINT', 'SIGTERM']

async function v8 (args) {
  const { status, outputDir, workingDir, name, onPort, pathToNodeBinary, collectDelay } = args

  const proc = spawn(pathToNodeBinary, [
    '--prof',
    `--logfile=${workingDir ? `${args.workingDir}/` : ''}%p-v8.log`,
    '--print-opt-source',
    '-r', path.join(__dirname, '..', 'lib', 'preload', 'no-cluster'),
    '-r', path.join(__dirname, '..', 'lib', 'preload', 'redir-stdout'),
    '-r', path.join(__dirname, '..', 'lib', 'preload', 'soft-exit'),
    ...(onPort ? ['-r', path.join(__dirname, '..', 'lib', 'preload', 'detect-port.js')] : [])
  ].concat(args.argv), {
    stdio: ['inherit', 'pipe', 'inherit', 'pipe', 'ignore', 'pipe']
  })

  // Isolate log is created before command is executed
  // Add pid to original args object so if command errors, external handlers can clean up
  args.pid = proc.pid

  const inlined = collectInliningInfo(proc)

  if (onPort) status('Profiling\n')
  else status('Profiling')

  proc.stdio[3].pipe(process.stdout)

  let closeTimer
  let softClosed = false
  const softClose = () => {
    if (softClosed) return
    softClosed = true
    status('Waiting for subprocess to exit...')
    closeTimer = setTimeout(() => {
      status('Closing subprocess is taking a long time, it might have hung. Press Ctrl+C again to force close')
    }, 3000)
    // Stop the subprocess; force stop it on the second SIGINT
    proc.stdio[5].destroy()

    onsoftexit = forceClose

    for (let i = 0; i < SOFT_EXIT_SIGNALS.length; i++) {
      process.once(SOFT_EXIT_SIGNALS[i], onsoftexit)
    }
  }
  const forceClose = () => {
    status('Force closing subprocess...')
    proc.kill()
  }

  let onsoftexit = softClose

  for (let i = 0; i < SOFT_EXIT_SIGNALS.length; i++) {
    process.once(SOFT_EXIT_SIGNALS[i], onsoftexit)
  }

  process.on('exit', forceClose)

  const whenPort = onPort && spawnOnPort(onPort, await when(proc.stdio[5], 'data'))

  let onPortError
  if (onPort) {
    // Graceful close once --on-port process ends
    onPortError = whenPort.then(() => {
      for (let i = 0; i < SOFT_EXIT_SIGNALS.length; i++) {
        process.removeListener(SOFT_EXIT_SIGNALS[i], onsoftexit)
      }
      softClose()
    }, (err) => {
      proc.kill()
      throw err
    })
  }

  const code = await Promise.race([
    when(proc, 'exit'),
    // This never resolves but may reject.
    // When the --on-port process ends, we still wait for proc's 'exit'.
    onPortError
  ].filter(Boolean))

  clearTimeout(closeTimer)

  for (let i = 0; i < SOFT_EXIT_SIGNALS.length; i++) {
    process.removeListener(SOFT_EXIT_SIGNALS[i], onsoftexit)
  }
  process.removeListener('exit', forceClose)

  args.onProcessExit(code)
  if (code | 0) {
    console.error('Target subprocess error, code: ' + code)
  }

  const folder = getTargetFolder({ outputDir, workingDir, name, pid: proc.pid })

  status('Process exited, generating flamegraph')

  debug('moving isolate file into folder')
  const isolateLog = v8.getIsolateLog(args.workingDir, proc.pid)

  if (!isolateLog) throw Error('no isolate logfile found')

  const isolateLogPath = path.join(folder, isolateLog)
  await moveSafe(path.join(args.workingDir, isolateLog), isolateLogPath)
  return {
    ticks: await v8LogToTicks(isolateLogPath, { pathToNodeBinary, collectDelay }),
    inlined: inlined,
    pid: proc.pid,
    folder: folder
  }
}

// Public method so it can be used in external error handlers
v8.getIsolateLog = function (workingDir, pid) {
  const regex = new RegExp(`isolate-(0x)?([0-9A-Fa-f]{2,16})(-${pid})?-${pid}-v8.log`)
  return fs.readdirSync(workingDir).find(regex.test.bind(regex))
}

async function moveSafe (from, to, tries = 0) {
  try {
    await fs.move(from, to)
  } catch (e) {
    if (tries > 5) {
      throw e
    }
    await sleep(1000)
    await moveSafe(from, to, tries + 1)
  }
}

function collectInliningInfo (sp) {
  let root
  let stdoutIsPrintOptSourceOutput = false
  let lastOptimizedFrame = null
  const inlined = {}

  // Try to parse an INLINE() item from the optimization log,
  // returning the length of the parsed code.
  // Returns 0 if it doesn't match and the line may be user output
  // Returns -1 if it doesn't match and the line should be ignored
  function tryParseInline (s) {
    if (/INLINE/.test(s)) {
      // Use non greedy match so that INLINE and FUNCTION SOURCE items
      // on the same line don't interfere, else the INLINE function name
      // would contain everything up to the ) in FUNCTION SOURCE ()
      const [match, inlinedFn] = /INLINE \((.*?)\) id\{/.exec(s) || [false]
      // shouldn't not match though..
      if (match === false) return -1

      if (lastOptimizedFrame === null) return -1
      const { fn, file } = lastOptimizedFrame
      // could be a big problem if the fn doesn't match
      if (fn !== inlinedFn) return -1

      const key = `${fn} ${file}`
      inlined[key] = inlined[key] || []
      inlined[key].push(lastOptimizedFrame)
      return match.length
    }
    return 0
  }

  pump(sp.stdout, split(), through((s, _, cb) => {
    let handled = false

    s += '\n'

    if (stdoutIsPrintOptSourceOutput === true && /^--- END ---/.test(s)) {
      stdoutIsPrintOptSourceOutput = false
      return cb()
    }

    // trace data
    if (stdoutIsPrintOptSourceOutput === false) {
      const inlineLength = tryParseInline(s)
      if (inlineLength !== 0) { // may be -1 for invalid INLINE() stmt
        handled = true
        // Continue parsing this line, it may contain more optimization information
        // if the log output is funny (see also the FUNCTION SOURCE comment)
        if (inlineLength > 0) {
          s = s.slice(inlineLength)
        }
      }

      // Reading v8 output from the stdout stream is sometimes unreliable. The next
      // FUNCTION SOURCE can be in the middle of a previous FUNCTION SOURCE, cutting
      // it off. The impact can be alleviated slightly by accepting FUNCTION SOURCE
      // identifiers that occur in the middle of a line.
      // The previous FUNCTION SOURCE block will not have been closed, but END lines
      // only set `stdoutIsPrintOptSourceOutput` to false, so we don't have to do
      // anything here. If the END logic changes the below may need to change as well.
      //
      // ref: https://github.com/davidmarkclements/0x/issues/122
      if (/--- FUNCTION SOURCE \(.*?\) id\{\d+,-?\d+\} start\{\d+\} ---\n$/.test(s)) {
        stdoutIsPrintOptSourceOutput = true
        const [match, file, fn = '(anonymous)', id, ix, pos] = /\((.+):(.+)?\) id\{(\d+),(-?\d+)\} start\{(\d+)\}/.exec(s) || [false]
        if (match === false) return cb()
        if (ix === '-1') root = { file, fn, id, ix, pos, key: `${fn} ${file}` }
        else {
          lastOptimizedFrame = { file, fn, id, ix, pos, caller: root }
        }
        handled = true
      }

      if (!handled) {
        process.stdout.write(s)
      }
    }

    cb()
  }))
  return inlined
}
