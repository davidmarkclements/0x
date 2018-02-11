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
const convert = require('./stack-convert')
const browserify = require('browserify')
const multistream = require('multistream')
const concat = require('concat-stream')
const eos = require('end-of-stream')
const gen = require('./gen')
const debug = require('debug')('0x')
const sll = require('single-line-log')
const launch = require('opn')
const profLogConvert = require('./prof-log-convert')

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
  stacksToFlamegraphStream: stacksToFlamegraphStream,
  tidy: tidy,
  pathTo: pathTo,
  notFound: notFound,
  unsupported: unsupported,
  isSudo: isSudo,
  noop: noop,
  createLoggers: createLoggers,
  stacksToFlamegraph,
  phases,
  v8ProfFlamegraph
}

function v8ProfFlamegraph (args, {folder, pid}, cb) {
  const { log } = args
  debug('moving isolate file into folder')
  const isolateLog = fs.readdirSync(args.workingDir)
    .find(function (f) {
      return new RegExp(`isolate-(0x[0-9A-Fa-f]{2,12})-${pid}-v8.log`).test(f)
    })

  if (!isolateLog) {
    log('0x: profViz fail: no isolate logfile found')
    return
  }

  const isolateLogPath = path.join(folder, isolateLog)

  fs.renameSync(path.join(args.workingDir, isolateLog), isolateLogPath)
  const stacksOut = path.join(folder, args.profOnly ? 'stacks.' + pid + '.out' : 'v8-prof-stacks.' + pid + '.out')
  const stream = fs.createWriteStream(stacksOut)
  profLogConvert({pid, isolateLogPath, stream}, args)

  stream.on('finish', () => {
    if (args.profOnly) return cb && cb()
    
    const fg = fs.openSync(path.join(folder, 'v8-prof-' + path.basename(determineHtmlPath(args, {pid, folder}))), 'w')
    // the stdout pipe, redirect to a file works though
    const sp = spawn(
      process.argv[0], 
      [path.join(__dirname, '..', 'cmd.js'), '-g', stacksOut, '--title', args.title],
      {
        stdio: [
          'ignore',
          fg,     // can't pipe to a write stream,  spawn seems to hit a data limit on 
          'inherit' // handy for debug output 
        ]
      }
    )
    
    sp.on('exit', () => {
      if (cb) cb()
    }) 
  })

}


function createLoggers (args) {
  const { io = {} } = args
  const logStream = io.logStream || process.stderr
  const statusStream = io.statusStream || logStream

  function log (msg, force) {
    if (args.silent) return
    if (!force && args.quiet) return 
    logStream.write(msg) 
  }
  const status = args.quiet || args.silent
    ? noop
    : sll(statusStream)

  return { log, status }
}

function determineOutputDir (args, proc) {
  var name = (args.outputDir || (
    args.timestampProfiles ? 
      '{timestamp}-{pid}.flamegraph' : 
      '{pid}.flamegraph'
  )).replace('{pid}', proc.pid || 'UNKNOWN_PID')
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

function stacksToFlamegraph (args) {
  const { ee, log } = args
  args.name = args.name || '-'
  const opts = {
    pid: args.pid, 
    folder: path.join(args.workingDir, path.dirname(args.gen))
  }
  debug('STACKS TO FLAMEGRAPH', args.gen)
  return fs.createReadStream(args.gen)
    .pipe(stacksToFlamegraphStream(args, opts, function () {
      debug('flamegraph generated')
      var htmlPath = determineHtmlPath(args, opts) 
      if (htmlPath !== '-' && args.workingDir) {
        var file = `file://${htmlPath}`
        log('\n  flamegraph generated in\n')
        log('    ' + file + '\n', true)
        log('\n')
        debug('done rendering')
        if (args.open) launch(file, {wait: false})
      }
      debug('done')
      ee.emit('done')
    }))
}

function stacksToFlamegraphStream (args, {pid, folder}, cb, preClear) {
  const { 
    log, tiers, langs, theme, name, open,
    exclude, include, jsonStacks, svg, ee,
    collectOnly, visualizeOnly, mapFrames
  } = args


  debug('begin rendering')
  return pumpify(split(), convert(mapFrames, function (err, json) {
    if (err) return ee.emit('error', err)
    debug('converted stacks to intermediate format')
    var title = args.title
    var opts = JSON.stringify({
      theme, title, exclude, include, langs, tiers
    })
    if (visualizeOnly === undefined && jsonStacks === true) {
      fs.writeFileSync(`${folder}/stacks.${pid}.json`, JSON.stringify(json, 0, 2))
    }
    if (collectOnly === true) {
      debug('--collect-only flag, bailing on rendering')
      tidy(args)
      log(`\n\n  stats collected in file://${folder}\n`, true)
      log('\n')
      debug('done')
      ee.emit('done')  
      return
    }

    multistream([
      browserify({standalone: 'd3'}).add(require.resolve('d3')).bundle(),
      browserify({standalone: 'hsl'}).add(require.resolve('hsl-to-rgb-for-reals')).bundle(),
      browserify({standalone: 'ui'}).add(path.join(__dirname, 'ui')).bundle(),
      browserify({standalone: 'gen'}).add(path.join(__dirname, 'gen')).bundle()
    ]).pipe(concat(function (bundle) {
      write(bundle + '\ngen(' + JSON.stringify(json) + ', ' + opts + ')')
    }))

    function write (src) {
      var htmlPath = determineHtmlPath(args, {pid, folder})
      var opts = {
        theme, title, svg, exclude, include, name,
        script: src.toString(),
        dir: folder,
        htmlPath: htmlPath,
        stdout: name === '-' || htmlPath === '-'
      }

      if (langs) opts.langs = langs
      if (tiers) opts.tiers = tiers

      gen(json, opts, preClear || noop, cb || function () {
        tidy(args)
        if (htmlPath !== '-') {
          var file = `file://${htmlPath}`
          log('flamegraph generated in\n')
          log(file + '\n', true)
          debug('done rendering')
          if (open) launch(file, {wait: false})
        }
        debug('done')
        ee.emit('done')
      })
    }
  }))
}

function tidy (args) {
  const { log } = args
  debug('tidying up')
  log('\u001b[?25h')

  fs.readdirSync('.')
    .filter(function (f) {
      return /isolate-(0x[0-9A-Fa-f]{2,12})-v8\.log/.test(f)
    })
    .forEach(function (f) {
      fs.unlinkSync(f)
    })
}

function pathTo ({ee}, bin) {
  if (!ee)
  if (fs.existsSync(bin)) { return bin }
  var path
  try { path = which.sync(bin) } catch (e) {
    ee.emit('error', Error('0x: Cannot find ' + bin + ' on your system!'))
  }
  return path
}

function notFound ({ee}, bin) {
  ee.emit('error', Error('0x: Unable to locate ' + bin + " - make sure it's in your PATH"))
}

function unsupported ({ee}, platform) {
  ee.emit('error', Error(`0x: ${platform} is not currently supported`))
}

function isSudo (cb) {
  var check = spawn('sudo', ['-n', 'true'])
  check.on('exit', function (code) {
    if (!code) return cb(true)
    cb(false)
  })
}

function noop () {}
