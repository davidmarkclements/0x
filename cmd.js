#!/usr/bin/env node

const fs = require('fs')
const minimist = require('minimist')
const zeroEks = require('./')
const { join } = require('path')
const { version } = require('./package.json')

cmd(process.argv.slice(2))

function cmd (argv) {
  var args = minimist(argv, {
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
      help: 'h',
      gen: 'g',
      jsonStacks: 'json-stacks',
      logOutput: 'log-output'
    },
    default: {
      node: false,
      name: 'flamegraph',
      nodeOptions: [],
      delay: 300
    }
  })

  if (args.version) return console.log('0x ' + version)

  if (!Array.isArray(args.nodeOptions)) {
    args.nodeOptions = args.nodeOptions.split(' ')
  }

  const nodeFlagsPresent = (args._[0][0] === '-')
  if (nodeFlagsPresent) {
    const scriptIx = args._.findIndex(([c0]) => c0 !== '-')

    args.nodeOptions = [
      ...args.nodeOptions, 
      ...args._.splice(0, scriptIx)
    ]
  }
   

  if (args.help) {
    console.log('\n')
    console.log('0x ' + version)
    return fs.createReadStream(join(__dirname, 'usage.txt')).pipe(process.stdout)
  }

  if (args.gen) return zeroEks.stacksToFlamegraph(args, (err) => {
      if (err) throw err
      process.exit()
  })

  args.script = args._

  if (args.logOutput && args.logOutput.toLowerCase() === 'stdout') {
    args.io = { logStream: process.stdout }
  }

  zeroEks(args, args.node, (err) => {
    if (err) throw err 
    process.exit()
  })
}
