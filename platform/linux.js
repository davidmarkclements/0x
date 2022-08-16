'use strict'
const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')
const debug = require('debug')('0x')
const traceStacksToTicks = require('../lib/trace-stacks-to-ticks')
const { promisify } = require('util')

const {
  getTargetFolder,
  tidy,
  pathTo,
} = require('../lib/util')

module.exports = promisify(linux)

const SOFT_EXIT_SIGNALS = ['SIGINT', 'SIGTERM']

function linux (args, sudo, cb) {
  const { status, outputDir, workingDir, name, onPort, pathToNodeBinary } = args
  if (onPort) {
    cb(Error('--on-port couldn\'t be used with Linux profiling. Run it in a separate terminal'))
    return
  }

  const perf = pathTo('perf')
  if (!perf) {
    cb(Error('Unable to locate perf - make sure it\'s in your PATH'))
    return
  }
  if (!sudo) {
    status('Stacks are captured using perf(1), which requires sudo access\n')
    return spawn('sudo', ['true'])
      .on('exit', function () { linux(args, true, cb) })
  }

  const uid = parseInt(Math.random() * 1e9, 10).toString(36)
  const perfdat = '/tmp/perf-' + uid + '.data'
  const kernelTracingDebug = args.kernelTracingDebug

  const proc = spawn('sudo', [
    '-E',
    'perf',
    'record',
    !kernelTracingDebug ? '-q' : '',
    '-F 99',
    '-g',
    '-o',
    perfdat,
    '--',
    pathToNodeBinary,
    '--perf-basic-prof',
    '-r', path.join(__dirname, '..', 'lib', 'preload', 'soft-exit.js'),
  ].filter(Boolean).concat(args.argv), {
    stdio: ['ignore', 'inherit', 'inherit', 'ignore', 'ignore', 'pipe']
  }).on('exit', function (code) {
    args.onProcessExit(code)
    if (code !== null && code !== 0 && code !== 143 && code !== 130) {
      tidy(args)
      console.error('Tracing subprocess error, code: ' + code)
      return
    }
    filterInternalFunctions(perfdat)
  })

  const folder = getTargetFolder({ outputDir, workingDir, name, pid: proc.pid })

  status('Profiling')

  const handleExit = () => {
    spawn('sudo', ['kill', '-SIGINT', '' + proc.pid], {
      stdio: 'inherit'
    })
  }

  for (let i = 0; i < SOFT_EXIT_SIGNALS.length; i++) {
    process.once(SOFT_EXIT_SIGNALS[i], handleExit)
  }

  function analyze (manual) {
    if (analyze.called) { return }
    analyze.called = true

    if (!manual) {
      debug('Caught SOFT_EXIT_SIGNAL, generating flamegraph')
      status('Caught SOFT_EXIT_SIGNAL, generating flamegraph')
      proc.on('exit', generate)
    } else {
      debug('Process exited, generating flamegraph')
      status('Process exited, generating flamegraph')
      generate()
    }

    function generate () {
      const stacks = spawn('sudo', ['perf', 'script', '-i', perfdat], {
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
          folder: folder,
          // TODO: Inlined functions through linux_perf was not implemented yet
          inlined: []
        })
      })
    }
  }

  function filterInternalFunctions (perfFile) {
    // Filtering out Node.js internal functions
    const sed = spawn('sudo', [
      'sed',
      '-i',
      '-e',
      '/( __libc_start| LazyCompile | v8::internal::| Builtin:| Stub:| LoadIC:|[unknown]| LoadPolymorphicIC:)/d',
      '-e',
      's/ LazyCompile:[*~]?/ /',
      perfFile
    ], {
      stdio: ['ignore', 'inherit', 'inherit', 'ignore', 'ignore', 'pipe']
    })

    sed.on('exit', function (code) {
      if (code !== null && code !== 0) {
        console.error('`sed` subprocess error, code: ' + code)
        return
      }
      analyze(true)
    })
  }
}
