'use strict'

const { sun, linux, windows, v8 } = require('./platform')
const { execSync } = require('child_process') 
const debug = require('debug')('0x')
const launch = require('opn')
const { join, isAbsolute, relative, dirname } = require('path')
const fs = require('fs')
const pump = require('pump')
const ajv = require('ajv')()
const traceStacksToTickStacks = require('./lib/trace-stacks-to-tick-stacks')
const v8LogToTickStacks = require('./lib/v8-log-to-tick-stacks')
const tickStacksToTree = require('./lib/tick-stacks-to-tree')
const schema = require('./schema.json')
const platform = process.platform
const {
  isSudo,
  silence,
  render,
  createBundle,
  tidy,
  noop,
  phases
} = require('./lib/util')

async function startProcessAndCollectTraceData (args, binary) {
  if (!Array.isArray(args.argv)) {
    throw Error('0x: argv option is required')
  }
  args.name = args.name || 'flamegraph'
  
  switch (args.kernelTracing ? platform : 'v8') {
    case 'v8': return v8(args, binary)
    case 'linux': return linux(args, await isSudo(), binary)
    case 'win32': return windows()
    default: return sun(args, await isSudo(), binary)
  }
}

async function zeroEks (args, binary) {
  args.name = args.name || 'flamegraph'
  args.log = args.log || noop
  args.status = args.status || noop
  validate(args)
  if (args.collectOnly && args.visualizeOnly) {
    throw Error('--collect-only and --visualize-only cannot be used together')
  }

  if (args.visualizeOnly) return visualize(args)

  args.title = args.title || 'node ' + args.argv.join(' ')

  const { collectOnly, jsonStacks } = args
  
  args.mapFrames = args.mapFrames || phases[args.phase]

  // kernel tracing returns a stream, default mode supplies json directly
  var { stacks, pid, folder } = await startProcessAndCollectTraceData(args, binary)

  const tree = tickStacksToTree(stacks, args.mapFrames)

  if (jsonStacks === true) {
    fs.writeFileSync(`${folder}/stacks.${pid}.json`, JSON.stringify(tree, 0, 2))
  }

  fs.writeFileSync(`${folder}/meta.json`, JSON.stringify(args, 0, 2))
  if (collectOnly === true) {
    const log = args.log
    debug('--collect-only flag, bailing on rendering')
    tidy(args)
    log(`\n\n  stats collected in file://${folder}\n`, true)
    log('\n')
    debug('done')
    return
  }

  await generateFlamegraph(args, {tree, pid, folder})
}

module.exports = zeroEks

function validate (args) {
  const privateProps = {
    workingDir: {type: 'string'}
  }
  const valid = ajv.compile({
      ...schema, 
      properties: {...schema.properties, ...privateProps}
    }
  )
  if (valid(args)) return
  const [{keyword, dataPath, params, message}] = valid.errors
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

async function visualize (args) {
  try { 
    const { visualizeOnly } = args
    const folder = isAbsolute(visualizeOnly) ? 
      relative(args.workingDir, visualizeOnly) :
      visualizeOnly
    const ls = fs.readdirSync(folder)
    const traceFile = /^stacks\.(.*)\.out$/    
    const isolateLog = /^isolate-(0x[0-9A-Fa-f]{2,12})-(.*)-v8.log$/
    const stacks = ls.find((f) => isolateLog.test(f) || traceFile.test(f))
    if (!stacks) {
      throw Error('Invalid data path provided to --visualize-only (no stacks or v8 log file found)')
    }

    const srcType = isolateLog.test(stacks) ? 'v8' : 'kernel-tracing'
    const rx = (srcType === 'v8') ? isolateLog : traceFile
    const pid = rx.exec(stacks)[1] 
    args.src = join(folder, stacks)


    if (!args.title) {
      try {
        const { title } = JSON.parse(fs.readFileSync(join(folder, 'meta.json')))
        args.title = title
      } catch (e) {
        debug(e)
      }
    }

    args.mapFrames = args.mapFrames || phases[args.phase]
    const tickStacks = (srcType === 'v8') ? 
      v8LogToTickStacks(args.src) :
      traceStacksToTickStacks(args.src)

    const tree = tickStacksToTree(tickStacks, args.mapFrames)

    await generateFlamegraph(args, {tree, pid, folder})

  } catch (e) {
    if (e.code === 'ENOENT') {
      throw Error('Invalid data path provided to --visualize-only (unable to access/does not exist)')
    } else if (e.code === 'ENOTDIR') {
      throw Error('Invalid data path provided to --visualize-only (not a directory)')
    } else throw e
  }
}