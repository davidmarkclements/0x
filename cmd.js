#!/usr/bin/env node

const fs = require('fs')
const minimist = require('minimist')
const { join } = require('path')
const zeroEks = require('./')
const { pathTo } = require('./lib/util')
const { version } = require('./package.json')

if (module.parent === null) cmd(process.argv.slice(2))
else module.exports = cmd 

function cmd (argv) {
  var args = minimist(argv, {
    stopEarly: true,
    '--': true,
    number: ['delay'],
    boolean: ['open', 'version', 'help', 'quiet', 'silent'],
    alias: {
      silent: 's',
      quiet: 'q',
      open: 'o',
      delay: 'd',
      'output-dir': 'D',
      version: 'v',
      nodeOptions: 'node-options',
      nodePath: 'node-path',
      help: 'h',
      gen: 'g',
      jsonStacks: 'json-stacks',
      logOutput: 'log-output'
    },
    default: {
      nodePath: false,
      name: 'flamegraph',
      nodeOptions: [],
      delay: 300
    }
  })

  if (args.version) return console.log('0x ' + version)

  if (!Array.isArray(args.nodeOptions)) {
    args.nodeOptions = args.nodeOptions.split(' ')
  }

  if (args.help) {
    console.log('\n')
    console.log('0x ' + version)
    return fs.createReadStream(join(__dirname, 'usage.txt')).pipe(process.stdout)
  }

  if (args.logOutput && args.logOutput.toLowerCase() === 'stdout') {
    args.io = { logStream: process.stdout }
  }

  if (args.gen) return zeroEks.stacksToFlamegraph(args, (err) => {
      if (err) throw err
      process.exit()
  })

  const dashDash = args['--']
  if (dashDash[0] && dashDash[0][0] === '-') {
    console.error('0x: The node binary must immediately follow double dash (--)')
    console.error('    0x [flags] -- node [nodeFlags] script.js [scriptFlags]')
    process.exit(1)
  }

  if (dashDash[0]) {
    if (dashDash[0][0] !== 'node' && args.nodePath === false) {
      args.nodePath = dashDash[0]
    }
    dashDash.shift()
    args.script = dashDash
  } else {
    args.script = args._
  }

  // console.log(args)

  zeroEks(args, args.nodePath, (err) => {
    if (err) {
      console.error('0x: FATAL', err.stack)
      process.exit(err.code || 1)
    } 
    process.exit()
  })
}
