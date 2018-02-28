#!/usr/bin/env node

const fs = require('fs')
const minimist = require('minimist')
const { join } = require('path')
const semver = require('semver')
const zeroEks = require('./')
const { version } = require('./package.json')
const debug = require('debug')('0x')

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
    number: ['delay', 'phase'],
    boolean: [
      'open', 'version', 'help', 'quiet', 
      'silent', 'jsonStacks', 'kernelTracingDebug',
      'kernelTracing', 'collectOnly'
    ],
    alias: {
      silent: 's',
      quiet: 'q',
      open: 'o',
      delay: 'd',
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
      delay: 0,
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
  return zeroEks(args)  
}
