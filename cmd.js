#!/usr/bin/env node
const path = require('path')

cmd()

function cmd () {
  var argv = process.argv.slice(2)

  if (~argv.indexOf('--cmd') || ~argv.indexOf('-c')) {
    return require('./command')(argv)
  }

  if (!argv.length || ~argv.indexOf('-h') || ~argv.indexOf('--help')) {
    process.stdout.write('\n')
    banner()
    return require('fs')
      .createReadStream(__dirname + '/usage.txt')
      .pipe(process.stdout)
  }

  if (~argv.indexOf('-v') || ~argv.indexOf('--version')) {
    return banner()
  }

  var stacksOnlyIx = argv.indexOf('--stacks-only')
  if (argv[stacksOnlyIx + 1] === '-') {
    argv[stacksOnlyIx] = '--stacks-only=-'
    argv.splice(stacksOnlyIx + 1, 1)
  }

  var args = require('minimist')(argv, {
    number: ['delay'],
    boolean: ['open'],
    alias: {
      open: 'o',
      delay: 'd',
      'output-dir': 'D'
    },
    default: {
      node: false,
      delay: 300
    }
  })

  args.script = args._[0]

  require('./')(args, args.node)
}

function banner() {
  var version = require('./package.json').version
  process.stdout.write('0x ' + version + '\n')
}
