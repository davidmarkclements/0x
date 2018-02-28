'use strict'

const { sun, linux, windows, v8 } = require('./platform')
const { execSync } = require('child_process') 
const { EventEmitter } = require('events')
const debug = require('debug')('0x')
const launch = require('opn')
const { join, isAbsolute, relative, dirname } = require('path')
const fs = require('fs')
const pump = require('pump')
const ajv = require('ajv')()
const schema = require('./schema.json')
const platform = process.platform
const {
  isSudo,
  silence,
  render,
  stacksToJson,
  createBundle,
  tidy,
  noop,
  phases
} = require('./lib/util')


async function stacksToFlamegraph (stackStream, args) {
  args.name = args.name || 'flamegraph'
  args.mapFrames = args.mapFrames || phases[args.phase]
  args.name = args.name || '-'
  args.title = args.title || ''
  const opts = {
    pid: args.pid, 
    folder: path.join(args.workingDir, path.dirname(args.src)),
    json: await stacksToJson(stackStream, args.mapFrames)
  }
  await generateFlamegraph(args, opts)
}

async function startProcessAndCollectTraceData (args, binary) {
  if (!Array.isArray(args.argv)) {
    throw Error('0x: argv option is required')
  }
  args.name = args.name || 'flamegraph'
  
  const platform = args.kernelTracing ? process.platform : 'v8'

  switch (platform) {
    case 'v8': return v8(args, binary)
    case 'linux': {
      const sudo = await isSudo()
      return linux(args, sudo, binary)
    }
    case 'win32': return windows()
    default: {
      const sudo = await isSudo()
      return sun(args, sudo, binary)
    }
  }
}

async function zeroEks (args) {
  args.name = args.name || 'flamegraph'
  validate(args)
  if (args.collectOnly && args.visualizeOnly) {
    throw Error('--collect-only and --visualize-only cannot be used together')
  }

  if (args.visualizeOnly) return visualize(args)
  
  const binary = resolveCommand(args)

  args.title = args.title || 'node ' + args.argv.join(' ')

  const { collectOnly, jsonStacks } = args
  
  args.mapFrames = args.mapFrames || phases[args.phase]

  const { stream, pid, folder } = await startProcessAndCollectTraceData(args, binary)
  const json = await stacksToJson(stream, args.mapFrames)
  if (jsonStacks === true) {
    fs.writeFileSync(`${folder}/stacks.${pid}.json`, JSON.stringify(json, 0, 2))
  }
  if (collectOnly === true) {
    const log = args.log
    debug('--collect-only flag, bailing on rendering')
    tidy(args)
    log(`\n\n  stats collected in file://${folder}\n`, true)
    log('\n')
    debug('done')
    return
  }

  await generateFlamegraph(args, {json, pid, folder})
}

zeroEks.stacksToFlamegraph = stacksToFlamegraph 
zeroEks.stacksToJson = stacksToJson

module.exports = zeroEks

function validate (args) {
  const privateProps = {workingDir: {type: 'string'}}
  const valid = ajv.compile({
      ...schema, 
      properties: {...schema.properties, ...privateProps}
    }
  )

  if (valid(args)) return

  const [{keyword, dataPath, params, message}] = ajv.errors
  if (keyword === 'type') {

    const flag = dataPath.substr(
      1, 
      dataPath[dataPath.length -1] === ']' ? 
        dataPath.length - 2 : 
        dataPath.length - 1 
    )
    const dashPrefix = flag.length === 1 ? '-' : '--'
    throw Error(`The ${dashPrefix}${flag} option ${message}\n`)
  }
  if (keyword === 'additionalProperties') {
    const flag = params.additionalProperty
    const dashPrefix = flag.length === 1 ? '-' : '--'
    throw Error(`${dashPrefix}${flag} is not a recognized flag\n`)
  }
}

async function generateFlamegraph (args, opts) {
  try  { 
    const file = await render(args, opts)
    const log = args.log
    log('flamegraph generated in\n')
    log(file + '\n', true)
    tidy(args)
    if (args.open) launch(file, {wait: false})
  } catch (err) {
    tidy(args)
    throw err
  }
}

function visualize (args) {
  try { 
    const { visualizeOnly } = args
    const dir = isAbsolute(visualizeOnly) ? 
      relative(args.workingDir, visualizeOnly) :
      visualizeOnly
    const ls = fs.readdirSync(dir)
    const rx = /^stacks\.(.*)\.out/
    const stacks = ls.find((f) => rx.test(f))
    if (!stacks) {
      throw Error('Invalid data path provided to --visualize-only (no stacks file)')
    }
    args.pid = rx.exec(stacks)[1] 
    args.src = join(dir, stacks)

    return stacksToFlamegraph(
      fs.createReadStream(args.src),
      args
    )
  } catch (e) {
    if (e.code === 'ENOENT') {
      throw Error('Invalid data path provided to --visualize-only (unable to access/does not exist)')
    } else if (e.code === 'ENOTIDR') {
      throw Error('Invalid data path provided to --visualize-only (not a directory)')
    } else throw e
  }
}

function resolveCommand (args) {
  const dashDash = args['--']
  if (dashDash[0] && dashDash[0][0] === '-') {
    throw Error(`The node binary must immediately follow double dash (--)
      0x [flags] -- node [nodeFlags] script.js [scriptFlags]
    `)
  }
  var binary = false
  if (dashDash[0]) {
    if (dashDash[0][0] !== 'node') binary = dashDash[0]
    dashDash.shift()
    args.argv = dashDash
  } else {
    args.argv = args._
  }
  return binary
}
