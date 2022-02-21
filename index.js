'use strict'

const { linux, v8 } = require('./platform')
const debug = require('debug')('0x')
const { join, isAbsolute, relative, dirname } = require('path')
const fs = require('fs')
const validate = require('./lib/validate')(require('./schema.json'))
const traceStacksToTicks = require('./lib/trace-stacks-to-ticks')
const v8LogToTicks = require('./lib/v8-log-to-ticks')
const ticksToTree = require('./lib/ticks-to-tree')
const render = require('./lib/render')
const { pathTo } = require('./lib/util')

const platform = process.platform
const { tidy, noop, isSudo } = require('./lib/util')

module.exports = zeroEks

async function zeroEks (args) {
  args.name = args.name || 'flamegraph'
  args.onProcessExit = args.onProcessExit || noop
  args.status = args.status || noop
  args.pathToNodeBinary = args.pathToNodeBinary || process.execPath
  if (args.pathToNodeBinary === 'node') {
    args.pathToNodeBinary = pathTo('node')
  }

  args.collectDelay = args.collectDelay || 0

  validate(args)
  const { collectOnly, visualizeOnly, writeTicks, treeDebug, mapFrames, visualizeCpuProfile, collectDelay } = args

  let incompatibleOptions = 0
  if (collectOnly) incompatibleOptions += 1
  if (visualizeOnly) incompatibleOptions += 1
  if (visualizeCpuProfile) incompatibleOptions += 1

  if (incompatibleOptions > 1) {
    throw Error('Only one of "collect only", "visualize only", "visualize cpu profile" can be used')
  }

  if (visualizeOnly) return visualize(args)
  if (visualizeCpuProfile) return cpuProfileVisualization(args)

  args.title = args.title || `node ${args.argv.join(' ')}`
  const { ticks, pid, folder, inlined } = await startProcessAndCollectTraceData(args)

  if (treeDebug === true) {
    const tree = await ticksToTree(ticks, {
      mapFrames, inlined, pathToNodeBinary: args.pathToNodeBinary
    })
    fs.writeFileSync(`${folder}/stacks.${pid}.json`, JSON.stringify(tree, 0, 2))
  }

  if (writeTicks) {
    fs.writeFileSync(`${folder}/ticks.json`, JSON.stringify(ticks))
  }

  fs.writeFileSync(`${folder}/meta.json`, JSON.stringify({ ...args, inlined }))

  if (collectOnly === true) {
    debug('collect-only mode bailing on rendering')
    tidy()
    debug('done')
    return folder
  }

  if (collectDelay) {
    debug('data collection will be delayed by ' + collectDelay + ' ms')
  }

  try {
    const file = generateFlamegraph({ ...args, ticks, inlined, pid, folder })
    return file
  } catch (err) {
    tidy()
    throw err
  }
}

async function startProcessAndCollectTraceData (args) {
  if (!Array.isArray(args.argv)) {
    throw Error('argv option is required')
  }
  args.name = args.name || 'flamegraph'

  switch (args.kernelTracing ? platform : 'v8') {
    case 'v8': return v8(args).catch((err) => {
      const logFilePath = join(args.workingDir, v8.getIsolateLog(args.workingDir, args.pid))
      let message = 'Fatal error in process observed by 0x. Incomplete V8 isolate log '

      if (process.env.DEBUG && process.env.DEBUG.includes('0x')) {
        message += `is readable for debugging at ${logFilePath}`
      } else {
        fs.unlinkSync(logFilePath)
        message += 'deleted. To preserve these logs, enable debugging (e.g. `DEBUG=0x* 0x my-app.js`)'
      }

      if (!args.quiet && !args.silent) console.warn(message)
      throw err
    })
    case 'linux': return linux(args, await isSudo())
    default:
      throw Error(`0x: ${platform} kernel tracing is not currently supported`)
  }
}

async function generateFlamegraph (opts) {
  const file = await render(opts)
  tidy()
  return file
}

function getFolder (file, workingDir) {
  return isAbsolute(file)
    ? relative(workingDir, file)
    : file
}

async function cpuProfileVisualization (opts) {
  const folder = dirname(opts.visualizeCpuProfile)
  const file = await render({ ...opts, folder })
  return file
}

async function visualize ({ visualizeOnly, treeDebug, workingDir, title, mapFrames, open, name, pathToNodeBinary, collectDelay }) {
  try {
    const folder = getFolder(visualizeOnly, workingDir)
    const ls = fs.readdirSync(folder)
    const traceFile = /^stacks\.(.*)\.out$/
    const isolateLog = /^isolate-((?:0x)?[0-9A-Fa-f]{2,16})(?:-\d*)?-(\d*)-v8\.(log|json)$/
    const stacks = ls.find((f) => isolateLog.test(f) || traceFile.test(f))
    if (!stacks) {
      throw Error('Invalid data path provided (no stacks or v8 log file found)')
    }

    let meta
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
      ? await v8LogToTicks(src, { pathToNodeBinary, collectDelay })
      : traceStacksToTicks(src)

    if (treeDebug === true) {
      const tree = await ticksToTree(ticks, {
        mapFrames, inlined, pathToNodeBinary
      })
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
      folder,
      pathToNodeBinary
    })

    return file
  } catch (e) {
    if (e.code === 'ENOENT') {
      throw Error('Invalid data path provided (unable to access/does not exist)')
    }
    if (e.code === 'ENOTDIR') {
      throw Error('Invalid data path provided (not a directory)')
    }
    throw e
  }
}
