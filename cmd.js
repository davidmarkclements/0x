#!/usr/bin/env node

const fs = require('fs')
const minimist = require('minimist')
const { join } = require('path')
const zeroEks = require('./')
const ajv = require('ajv')()
const { pathTo } = require('./lib/util')
const { version } = require('./package.json')
const schema = require('./cli-schema.json')
const validate = ajv.compile(schema)

const defaultBanner = `
  0x ${version}
  
  0x [flags] -- node [nodeFlags] script.js [scriptFlags]

`

if (module.parent === null) cmd(process.argv.slice(2))
else module.exports = cmd 

function cmd (argv, banner = defaultBanner) {
  var args = minimist(argv, {
    stopEarly: true,
    '--': true,
    number: ['delay'],
    boolean: ['open', 'version', 'help', 'quiet', 'silent', 'jsonStacks', 'svg'],
    alias: {
      silent: 's',
      quiet: 'q',
      open: 'o',
      delay: 'd',
      'output-dir': 'D',
      version: 'v',
      help: 'h',
      gen: 'g',
      langs: 'l',
      tiers: 't',
      jsonStacks: 'json-stacks',
      logOutput: 'log-output'
    },
    default: {
      name: 'flamegraph',
      delay: 300
    }
  })

  if (ajv.validate(schema, args) === false) {
    const [{keyword, dataPath, params, message}] = ajv.errors
    if (keyword === 'type') {
      const flag = dataPath.substr(1)
      const dashPrefix = flag.length === 1 ? '-' : '--'
      console.error(`\n  0x: the ${dashPrefix}${flag} option ${message}\n`)
    }
    if (keyword === 'additionalProperties') {
      const flag = params.additionalProperty
      const dashPrefix = flag.length === 1 ? '-' : '--'
      console.error(`\n  0x: ${dashPrefix}${flag} is not a recognized flag\n`)
    }
    process.exit(1)
  }

  var binary = false

  if (args.version) return console.log('0x ' + version)

  if (args.help || argv.length === 0) {
    process.stdout.write(banner)

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
    if (dashDash[0][0] !== 'node') binary = dashDash[0]
    dashDash.shift()
    args.script = dashDash
  } else {
    args.script = args._
  }

  args.title = args.title || 'node ' + args.script.join(' ')

  zeroEks(args, binary, (err) => {
    if (err) {
      console.error('0x: FATAL', err.stack)
      process.exit(err.code || 1)
    } 
    process.exit()
  })
}
