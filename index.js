'use strict'

const { sun, linux, windows, v8 } = require('./platform')
const debug = require('debug')('0x')
const { join, isAbsolute, relative } = require('path')
const fs = require('fs')
const validate = require('./lib/validate')(require('./schema.json'))
const traceStacksToTicks = require('./lib/trace-stacks-to-ticks')
const v8LogToTicks = require('./lib/v8-log-to-ticks')
const ticksToTree = require('./lib/ticks-to-tree')
const render = require('./lib/render')

const platform = process.platform
const { tidy, noop, isSudo } = require('./lib/util')

module.exports = zeroEks

async function zeroEks (args) {
  args.name = args.name || 'flamegraph'
  args.status = args.status || noop
  validate(args)
  const { collectOnly, visualizeOnly, treeDebug, mapFrames } = args
  if (collectOnly && visualizeOnly) {
    throw Error('"collect only" and "visualize only" cannot be used together')
  }

  if (visualizeOnly) return visualize(args)

  args.title = args.title || 'node ' + args.argv.join(' ')
  const binary = args.pathToNodeBinary
  var { ticks, pid, folder, inlined } = await startProcessAndCollectTraceData(args, binary)

  if (treeDebug === true) {
    const tree = await ticksToTree(ticks, args, mapFrames, inlined)
    fs.writeFileSync(`${folder}/stacks.${pid}.json`, JSON.stringify(tree, 0, 2))
  }

  fs.writeFileSync(`${folder}/meta.json`, JSON.stringify({...args, inlined}))

  if (collectOnly === true) {
    debug('collect-only mode bailing on rendering')
    tidy()
    debug('done')
    return folder
  }

  try {
    const file = await generateFlamegraph({...args, ticks, inlined, pid, folder})
    return file
  } catch (err) {
    tidy()
    throw err
  }
}

async function startProcessAndCollectTraceData (args, binary) {
  if (!Array.isArray(args.argv)) {
    throw Error('argv option is required')
  }
  args.name = args.name || 'flamegraph'

  switch (args.kernelTracing ? platform : 'v8') {
    case 'v8': return v8(args, binary)
    case 'linux': return linux(args, await isSudo(), binary)
    case 'win32': return windows()
    default: return sun(args, await isSudo(), binary)
  }
}

async function generateFlamegraph (opts) {
  try {
    const file = await render(opts)
    tidy()
    return file
  } catch (err) {
    tidy()
    throw err
  }
}

async function visualize ({ visualizeOnly, treeDebug, workingDir, title, mapFrames, phase, open, name }) {
  try {
    const folder = isAbsolute(visualizeOnly)
      ? relative(workingDir, visualizeOnly)
      : visualizeOnly
    const ls = fs.readdirSync(folder)
    const traceFile = /^stacks\.(.*)\.out$/
    const isolateLog = /^isolate-((0x)?[0-9A-Fa-f]{2,16})-(.*)-v8\.(log|json)$/
    const stacks = ls.find((f) => isolateLog.test(f) || traceFile.test(f))
    if (!stacks) {
      throw Error('Invalid data path provided (no stacks or v8 log file found)')
    }

    var meta
    try {
      meta = JSON.parse(fs.readFileSync(join(folder, 'meta.json')))
    } catch (e) {
      meta = {}
      debug(e)
    }

    const srcType = isolateLog.test(stacks) ? 'v8' : 'kernel-tracing'
    const rx = (srcType === 'v8') ? isolateLog : traceFile
    const pid = rx.exec(stacks)[srcType === 'v8' ? 2 : 1]
    const { inlined } = meta
    const src = join(folder, stacks)
    title = title || meta.title
    name = name || meta.name

    const ticks = (srcType === 'v8')
      ? await v8LogToTicks(src)
      : traceStacksToTicks(src)

    if (treeDebug === true) {
      const tree = await ticksToTree(ticks, mapFrames, inlined)
      fs.writeFileSync(`${folder}/stacks.${pid}.json`, JSON.stringify(tree, 0, 2))
    }

    const file = await generateFlamegraph({
      visualizeOnly,
      treeDebug,
      workingDir,
      title,
      name,
      mapFrames,
      open,
      ticks,
      inlined,
      pid,
      folder
    })

    return file
  } catch (e) {
    if (e.code === 'ENOENT') {
      throw Error('Invalid data path provided (unable to access/does not exist)')
    } else if (e.code === 'ENOTDIR') {
      throw Error('Invalid data path provided (not a directory)')
    } else throw e
  }
}
