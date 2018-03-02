#!/usr/bin/env node

const fs = require('fs')
const minimist = require('minimist')
const { join } = require('path')
const semver = require('semver')
const zeroEks = require('./')
const { version } = require('./package.json')
const debug = require('debug')('0x')
const sll = require('single-line-log')

const defaultBanner = `
  0x ${version}
  
  0x [flags] -- node [nodeFlags] script.js [scriptFlags]

`

if (module.parent === null) {
  cmd(process.argv.slice(2)).catch((err) => {
    console.error('0x: ', err.message)
    debug(err)
    process.exit(err.code || 1)
  })
} else module.exports = cmd

function cmd (argv, banner = defaultBanner) {
  var args = minimist(argv, {
    stopEarly: true,
    '--': true,
    number: ['phase'],
    boolean: [
      'open', 'version', 'help', 'quiet', 
      'silent', 'jsonStacks', 'kernelTracingDebug',
      'kernelTracing', 'collectOnly'
    ],
    alias: {
      silent: 's',
      quiet: 'q',
      open: 'o',
      'output-dir': 'outputDir',
      D: 'outputDir',
      'output-html': 'outputHtml',
      F: 'outputHtml', 
      version: 'v',
      help: 'h',
      jsonStacks: 'json-stacks',
      loggingOutput: 'logging-output',
      visualizeOnly: 'visualize-only',
      collectOnly: 'collect-only',
      kernelTracing: 'kernel-tracing',
      kernelTracingDebug: 'kernel-tracing-debug',
    },
    default: {
      phase: 2
    }
  })

  if (semver.lt(process.version, '8.5.0') === true) {
    console.error('0x v4 supports Node 8.5.0 and above, current Node version is ' + process.version)
    console.error('On Linux, macOS or Solaris the --kernel-tracing flag\nmay be able to generate a flamegraph with the current Node version')
    console.error('See 0x --help for more info')
    process.exit(1)
  }

  if (args.help || argv.length === 0) {
    process.stdout.write(banner)
    return fs.createReadStream(join(__dirname, 'usage.txt')).pipe(process.stdout)
  }

  if (args.version) return console.log('0x ' + version)
  args.workingDir = process.cwd()
  args.log = createLogger(args)
  args.status = createStatus(args)
  const { pathToNodeBinary, subprocessArgv } = parseSubprocessCommand(args)
  args.argv = subprocessArgv

  return zeroEks(args, pathToNodeBinary)  
}

function parseSubprocessCommand (args) {
  const dashDash = args['--']
  if (dashDash[0] && dashDash[0][0] === '-') {
    throw Error(`The node binary must immediately follow double dash (--)
      0x [flags] -- node [nodeFlags] script.js [scriptFlags]
    `)
  }
  var pathToNodeBinary = false
  var subprocessArgv = args._
  if (dashDash[0]) {
    if (dashDash[0][0] !== 'node') pathToNodeBinary = dashDash[0]
    dashDash.shift()
    subprocessArgv = dashDash
  }
  return { pathToNodeBinary, subprocessArgv }
}

function createLogger ({silent, quiet}) {
  const logStream = process.stderr
  return function log (msg, force) {
    if (silent) return
    if (!force && quiet) return 
    logStream.write(msg) 
  }
}

function createStatus ({silent, quiet}) {
  const statusStream = process.stderr 
  return quiet || silent
    ? () => {}
    : sll(statusStream)
}