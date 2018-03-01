'use strict'

const { EventEmitter } = require('events')
const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')
const which = require('which')
const pump = require('pump')
const pumpify = require('pumpify')
const split = require('split2')
const through = require('through2')
const convert = require('stacks-to-json-stack-tree')
const browserify = require('browserify')
const multistream = require('multistream')
const concat = require('concat-stream')
const eos = require('end-of-stream')
const debug = require('debug')('0x')
const launch = require('opn')
const { promisify } = require('util')
const profLogConvert = require('./prof-log-convert')
const html = require('./visualize/html')

const phases = [
  (frames) => frames,
  (frames) => {
    var moduleRunMain = frames.find((frame) => /Module.runMain module.js/.test(frame))
    if (moduleRunMain) {
      const startupIndex = frames.findIndex((frame) => /startup bootstrap_node/.test(frame))
      if (startupIndex !== -1) frames.splice(startupIndex, 1)
      return frames
    } 

    var startup = frames.find((frame) => /startup bootstrap_node/.test(frame))
    if (startup) return false
    return frames
  },
  (frames) => {
    if (frames.find((frame) => /startup bootstrap_node/.test(frame))) return false
    return frames
  }
]

module.exports = {
  determineOutputDir: determineOutputDir,
  ensureDirExists: ensureDirExists,
  tidy: tidy,
  pathTo: pathTo,
  isSudo: isSudo,
  noop: noop,
  stacksToJson,
  render,
  createBundle,
  phases,
  v8ProfFlamegraph
}

async function v8ProfFlamegraph (args, {folder, pid}) {
  debug('moving isolate file into folder')
  const isolateLog = fs.readdirSync(args.workingDir).find(function (f) {
    return new RegExp(`isolate-(0x[0-9A-Fa-f]{2,12})-${pid}-v8.log`).test(f)
  })

  if (!isolateLog) throw Error('no isolate logfile found')

  const isolateLogPath = path.join(folder, isolateLog)

  fs.renameSync(path.join(args.workingDir, isolateLog), isolateLogPath)
  const stacksOut = path.join(folder, 'stacks.' + pid + '.out')
  const stream = fs.createWriteStream(stacksOut)
  profLogConvert({pid, isolateLogPath, stream}, args)

  return new Promise((resolve) => stream.once('finish', resolve))
}

function determineOutputDir (args, proc) {
  var name = (args.outputDir || '{pid}.0x').replace('{pid}', proc.pid || 'UNKNOWN_PID')
  .replace('{timestamp}', Date.now())
  .replace('{cwd}', args.workingDir)
  .replace('{name}', args.name)

  return path.resolve(args.workingDir, name)
}

function determineHtmlPath (args, {pid, folder}) {
  if (args.name === '-') return '-'
  var htmlPath = (args.outputHtml || ( 
      `{outputDir}${path.sep}{name}.html`
  )).replace('{pid}', pid || 'UNKNOWN_PID')
  .replace('{timestamp}', Date.now())
  .replace('{outputDir}', folder)
  .replace('{cwd}', args.workingDir)
  .replace('{name}', args.name)

  if (path.isAbsolute(htmlPath) === false) {
    htmlPath = path.join(args.workingDir, htmlPath)
  }
  return htmlPath
}


function ensureDirExists (path) {
  try {
    fs.accessSync(path)
  } catch (e) {
    if (e.code === 'ENOENT') {
      fs.mkdirSync(path)
    } else {
      throw e
    }
  }
}

function stacksToJson (stream, mapFrames) {
  return new Promise((resolve, reject) => {
    pump(stream, split(), convert(mapFrames, function (err, json) {
      if (err) reject(err)
      else resolve(json)
    }))
  })
}

function createBundle () {
  return new Promise((resolve, reject) => {
    pump(
      multistream([
        browserify({standalone: 'd3'}).add(require.resolve('d3')).bundle(),
        browserify({standalone: 'hsl'}).add(require.resolve('hsl-to-rgb-for-reals')).bundle(),
        browserify({standalone: 'ui'}).add(require.resolve('d3-fg')).bundle(),
        browserify({standalone: 'visualize'}).add(path.join(__dirname, 'visualize')).bundle()
      ]),
      concat(resolve),
      (err) => err && reject(err)
    )
  })
}

async function render (args, {json, pid, folder}) {
  const { name, title } = args
  debug('converted stacks to intermediate format')
  const script = `${await createBundle()}\nvisualize(${JSON.stringify(json)}, ${JSON.stringify({title})})`

  const htmlPath = determineHtmlPath(args, {pid, folder})
  const opts = {
    title,
    name,
    script,
    htmlPath,
    dir: folder,
    stdout: name === '-' || htmlPath === '-'
  }

  await html(json, opts)
  debug('done rendering')
  return htmlPath === '-' ? null : `file://${htmlPath}`
}

function tidy (args) {
  debug('tidying up')

  fs.readdirSync('.')
    .filter(function (f) {
      return /isolate-(0x[0-9A-Fa-f]{2,12})-v8\.log/.test(f)
    })
    .forEach(function (f) {
      fs.unlinkSync(f)
    })
}

function pathTo (bin) {
  if (fs.existsSync(bin)) { return bin }
  return which.sync(bin)
}

function isSudo () {
  var check = spawn('sudo', ['-n', 'true'])
  return new Promise((resolve, reject) => {
    check.on('error', reject)
    check.on('exit', function (code) {
      if (!code) return resolve(true)
      resolve(false)
    })
  })
}

function noop () {}
