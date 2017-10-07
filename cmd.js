#!/usr/bin/env node
const path = require('path')

cmd()

function cmd () {
  var argv = process.argv.slice(2)

  var args = require('minimist')(argv, {
    number: ['delay'],
    boolean: ['open', 'version', 'help', 'cmd'],
    alias: {
      open: 'o',
      delay: 'd',
      'output-dir': 'D',
      version: 'v',
      nodeOptions: 'node-options',
      help: 'h',
      cmd: 'c'
    },
    default: {
      node: false,
      nodeOptions: [],
      delay: 300
    }
  })

  if (args.version) {
    return banner()
  }

  if (!Array.isArray(args.nodeOptions)) {
    args.nodeOptions = args.nodeOptions.split(' ')
  }

  if (args.help) {
    process.stdout.write('\n')
    banner()
    return require('fs')
      .createReadStream(__dirname + '/usage.txt')
      .pipe(process.stdout)
  }

  if (args.cmd) {
    return require('./command')(argv)
  }

  args.script = args._

  require('./')(args, args.node)
}

function banner() {
  var version = require('./package.json').version
  process.stdout.write('0x ' + version + '\n')
}
