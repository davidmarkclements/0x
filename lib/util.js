'use strict'

const fs = require('fs')
const path = require('path')
const spawn = require('child_process').spawn
const which = require('which')
const pump = require('pump')
const pumpify = require('pumpify')
const split = require('split2')
const through = require('through2')
const convert = require('./stack-convert')
const browserify = require('browserify')
const multistream = require('multistream')
const concat = require('concat-stream')
const gen = require('./gen')
const debug = require('debug')('0x')
const sll = require('single-line-log')
const launch = require('open')

module.exports = {
  getProfileFolderName: getProfileFolderName,
  ensureDirExists: ensureDirExists,
  stackLine: stackLine,
  stacksToFlamegraphStream: stacksToFlamegraphStream,
  tidy: tidy,
  pathTo: pathTo,
  notFound: notFound,
  unsupported: unsupported,
  isSudo: isSudo,
  noop: noop,
  createLoggers: createLoggers,
  stacksToFlamegraph
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

function getProfileFolderName (args, proc) {
  var name = args.outputDir

  if (!name) {
    name = proc.pid + '.flamegraph'
  }

  if (args.timestampProfiles) {
    name = Date.now() + '-' + name
  }

  return path.resolve(args.workingDir, name)
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

function stackLine (stacks, delay) {
  if (!delay) {
    return pump(stacks.stdout, split())
  }

  var start
  var pastDelay

  return pump(
    stacks.stdout,
    split(),
    through(function (line, enc, cb) {
      var diff
      line += ''
      if (/cpu-clock:/.test(line)) {
        if (!start) {
          start = parseInt(parseFloat(line.match(/[0-9]+\.[0-9]+:/)[0], 10) * 1000, 10)
        } else {
          diff = parseInt(parseFloat(line.match(/[0-9]+\.[0-9]+:/)[0], 10) * 1000, 10) - start
          pastDelay = (diff > delay)
        }
      }
      if (pastDelay) {
        cb(null, line + '\n')
      } else {
        cb()
      }
    })
  )
}

function stacksToFlamegraph (args, cb) {
  const { ee, log } = args
  args.name = args.name || '-'
  return fs.createReadStream(args.gen)
    .pipe(stacksToFlamegraphStream(args, {}, function () {
      debug('flamegraph generated')
      if (args.open && args.name !== '-' && args.workingDir) {
        var file = `file://${args.workingDir}/${args.name}.html`
        log('\n  flamegraph generated in\n')
        log('    ' + file + '\n', true)
        log('\n')
        debug('done rendering')
        if (args.open) launch(file)
      }
      debug('done')
      ee.emit('done')
    }))
}

function stacksToFlamegraphStream (args, {pid, folder}, cb, preClear) {
  const { 
    log, tiers, langs, theme, name, open,
    exclude, include, jsonStacks, svg, ee,
    collectOnly, visualizeOnly
  } = args

  debug('begin rendering')
  return pumpify(split(), convert(function (err, json) {
    if (err) return ee.emit('error', err)
    debug('converted stacks to intermediate format')
    var title = args.title
    var opts = JSON.stringify({
      theme, title, exclude, include, langs, tiers
    })

    if (visualizeOnly === false && jsonStacks === true) {
      fs.writeFileSync(`${folder}/stacks.${pid}.json`, JSON.stringify(json, 0, 2))
    }
    if (collectOnly === true) {
      debug('--collect-only flag, bailing on rendering')
      tidy(args)
      var file = `/${name}.html`
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
      var opts = {
        theme, title, svg, exclude, include, name,
        script: src.toString(),
        dir: folder
      }

      if (langs) opts.langs = langs
      if (tiers) opts.tiers = tiers

      gen(json, opts, preClear || noop, cb || function () {
        tidy(args)
        var file = `file://${folder}/${name}.html`
        log('flamegraph generated in\n')
        log(file + '\n', true)
        debug('done rendering')
        if (open) launch(file)
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

function unsupported ({ee}) {
  ee.emit('error', Error('0x: Windows is not supported'))
}

function isSudo (cb) {
  var check = spawn('sudo', ['-n', 'true'])
  check.on('exit', function (code) {
    if (!code) return cb(true)
    cb(false)
  })
}

function noop () {}

