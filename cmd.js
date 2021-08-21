#!/usr/bin/env node

const fs = require('fs')
const { join } = require('path')
const minimist = require('minimist')
const semver = require('semver')
const debug = require('debug')('0x')
const sll = require('single-line-log')
const launch = require('opn')
const hasUnicode = require('has-unicode')()
const zeroEks = semver.lt(process.version, '8.5.0') === true ? () => {} : require('./')
const { version } = require('./package.json')

const defaultBanner = `
  0x ${version}

  0x [flags] -- node [nodeFlags] script.js [scriptFlags]

`

if (module.parent === null) {
  cmd(process.argv.slice(2)).catch((err) => {
    err.message = hasUnicode ? `\n🚫  ${err.message}` : `\n${err.message}`
    console.error(err)
    debug(err)
    process.exit(err.code || 1)
  })
} else {
  module.exports = cmd
}

async function cmd (argv, banner = defaultBanner) {
  if (semver.lt(process.version, '8.5.0') === true) {
    throw Error(
      `Node version unsupported. Current Node version is ${process.version}\n` +
      'Support extends from Node 8.5.0 and above.\n\n' +
      '  npm i -g 0x@3 for Node 6.x.x – 8.4.0\n' +
      '  npm i -g 0x@2 for Node 4\n'
    )
  }

  const args = minimist(argv, {
    stopEarly: true,
    '--': true,
    boolean: [
      'open', 'version', 'help', 'quiet',
      'silent', 'treeDebug', 'kernelTracingDebug',
      'kernelTracing', 'collectOnly', 'writeTicks'
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
      visualizeOnly: 'visualize-only',
      visualizeCpuProfile: 'visualize-cpu-profile',
      collectOnly: 'collect-only',
      collectDelay: 'collect-delay',
      kernelTracing: 'kernel-tracing',
      kernelTracingDebug: 'kernel-tracing-debug',
      treeDebug: 'tree-debug',
      writeTicks: 'write-ticks',
      onPort: 'on-port',
      P: 'onPort'
    }
  })

  if (args.help || argv.length === 0) {
    process.stdout.write(banner)
    return fs.createReadStream(join(__dirname, 'usage.txt')).pipe(process.stdout)
  }

  if (args.version) {
    return console.log(`0x ${version}`)
  }

  const status = createStatus(args)
  const { pathToNodeBinary, subprocessArgv } = parseSubprocessCommand(args)

  args.workingDir = process.cwd()
  args.status = status
  args.argv = subprocessArgv
  args.pathToNodeBinary = pathToNodeBinary

  if (args.visualizeOnly) {
    status(`Creating flamegraph from ${args.visualizeOnly}`)
  }

  if (args.visualizeCpuProfile) {
    status(`Creating flamegraph from v8 profile ${args.visualizeCpuProfile}`)
  }

  const assetPath = await zeroEks(args)

  if (args.collectOnly) {
    status(`Stats collected in folder file://${assetPath}\n`)
  } else {
    status(`Flamegraph generated in\n${assetPath}\n`)
    if (args.open) {
      launch(assetPath, { wait: false })
    }
  }

  return assetPath
}

function parseSubprocessCommand (args) {
  const dashDash = args['--']
  let pathToNodeBinary = process.argv[0]
  let subprocessArgv = args._

  if (dashDash.length !== 0) {
    const dashEntry = dashDash[0][0]
    if (dashEntry === '-') {
      throw Error(
        'The node binary must immediately follow double dash (--)\n' +
        '0x [flags] -- node [nodeFlags] script.js [scriptFlags]'
      )
    }
    pathToNodeBinary = dashDash[0]
    dashDash.shift()
    subprocessArgv = dashDash
  }
  return { pathToNodeBinary, subprocessArgv }
}

function createStatus ({ silent, quiet }) {
  if (quiet || silent) {
    return () => {}
  }
  const status = sll(process.stderr)
  return hasUnicode ? (s) => status(`🔥  ${s}`) : status
}
