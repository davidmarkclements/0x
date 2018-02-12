#!/usr/bin/env node

const fs = require('fs')
const minimist = require('minimist')
const { join, isAbsolute, relative } = require('path')
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
    number: ['delay', 'phase'],
    boolean: [
      'open', 'version', 'help', 'quiet', 
      'silent', 'jsonStacks', 'svg', 'traceInfo',
      'collectOnly', 'timestampProfiles', 'profViz', 'profOnly'
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
      gen: 'g',
      langs: 'l',
      tiers: 't',
      timestampProfiles: 'timestamp-profiles',
      traceInfo: 'trace-info',
      jsonStacks: 'json-stacks',
      logOutput: 'log-output',
      visualizeOnly: 'visualize-only',
      collectOnly: 'collect-only',
      profViz: 'prof-viz',
      profOnly: 'prof-only'
    },
    default: {
      delay: 0,
      phase: 2
    }
  })

  if ((args.profViz || args.profOnly) && process.version.substr(0, 3) === 'v6.') {
    console.error('0x: The --prof-viz/--prof-only flag is only supported in Node 8 and above')
    process.exit(1)
  }

  if (args.profViz && args.profOnly) {
    console.error('\n 0x: --prof-viz and --prof-only cannot be used together')
    process.exit(1)
  }

  args.name = args.name || (args.gen ? '-' : 'flamegraph')

  if (ajv.validate(schema, args) === false) {
    const [{keyword, dataPath, params, message}] = ajv.errors
    if (keyword === 'type') {

      const flag = dataPath.substr(
        1, 
        dataPath[dataPath.length -1] === ']' ? 
          dataPath.length - 2 : 
          dataPath.length -1 
      )
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

  if (args.collectOnly && args.visualizeOnly) {
    console.error('\n 0x: --collect-only and --visualize-only cannot be used together')
    process.exit(1)
  }

  if (args.gen && args.visualizeOnly) {
    console.error('\n 0x: --gen and --visualize-only cannot be used together')
    process.exit(1)
  }
  
  args.workingDir = process.cwd()

  if (args.version) return console.log('0x ' + version)

  if (args.help || argv.length === 0) {
    process.stdout.write(banner)

    return fs.createReadStream(join(__dirname, 'usage.txt')).pipe(process.stdout)
  }

  if (args.logOutput && args.logOutput.toLowerCase() === 'stdout') {
    args.io = { logStream: process.stdout }
  }

  if (args.visualizeOnly) {
    try { 
      const { visualizeOnly } = args
      const dir = isAbsolute(visualizeOnly) ? 
        relative(args.workingDir, visualizeOnly) :
        visualizeOnly
      const ls = fs.readdirSync(dir)
      const rx = /^stacks\.(.*)\.out/
      const stacks = ls.find((f) => rx.test(f))
      if (!stacks) {
        console.error('\n  0x: Invalid data path provided to --visualize-only (no stacks file)')
        process.exit(1)
      }
      args.pid = rx.exec(stacks)[1] 
      args.gen = join(dir, stacks)
    } catch (e) {
      if (e.code === 'ENOENT') {
        console.error('\n  0x: Invalid data path provided to --visualize-only (unable to access/does not exist)')
        process.exit(1)
      } else if (e.code === 'ENOTIDR') {
        console.error('\n  0x: Invalid data path provided to --visualize-only (not a directory)')
        process.exit(1)
      } else throw e
    }
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

  var binary = false
  if (dashDash[0]) {
    if (dashDash[0][0] !== 'node') binary = dashDash[0]
    dashDash.shift()
    args.argv = dashDash
  } else {
    args.argv = args._
  }

  args.title = args.title || 'node ' + args.argv.join(' ')

  zeroEks(args, binary, (err) => {
    if (err) {
      console.error('0x: FATAL', err.stack)
      process.exit(err.code || 1)
    } 
    process.exit()
  })
}
