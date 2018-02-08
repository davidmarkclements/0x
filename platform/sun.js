'use strict'
const fs = require('fs')
const path = require('path')
const spawn = require('child_process').spawn
const pump = require('pump')
const split = require('split2')
const sym = require('perf-sym')
const debug = require('debug')('0x')

const {
  determineOutputDir,
  ensureDirExists,
  stacksToFlamegraphStream,
  tidy,
  pathTo,
  notFound,
  v8ProfFlamegraph
} = require('../lib/util')

module.exports = sun

function sun (args, sudo, binary) {
  const { status, log, ee } = args
  var dtrace = pathTo(args, 'dtrace')
  var profile = require.resolve('perf-sym/profile_1ms.d')
  if (!dtrace) return notFound(args, 'dtrace')
  if (!sudo) {
    log('0x captures stacks using dtrace, which requires sudo access\n')
    return spawn('sudo', ['true'])
      .on('exit', function () { sun(args, true, binary) })
  }
  var node = !binary || binary === 'node' ? pathTo(args, 'node') : binary
  var traceInfo = args.traceInfo
  var delay = args.delay || args.d
  delay = parseInt(delay, 10)
  if (isNaN(delay)) { delay = 0 }

  args = Object.assign([
    '--perf-basic-prof',
    '-r', path.join(__dirname, '..', 'lib', 'soft-exit')
  ].concat(args.argv), args)

  if (args.profViz) {
    args.unshift('--prof')
    args.unshift('--logfile=%p-v8.log')    
  }

  var proc = spawn(node, args, {
    stdio: 'inherit'
  }).on('exit', function (code) {
    if (code !== 0) {
      tidy(args)
      const err = Error('0x Target subprocess error, code: ' + code)
      err.code = code
      ee.emit('error', err, code)
      return
    }
    analyze(true)
  })
  var folder
  var prof
  var profExited = false

  function start () {
    prof = spawn('sudo', [profile, '-p', proc.pid])

    if (traceInfo) { prof.stderr.pipe(process.stderr) }

    folder = determineOutputDir(args, proc)
    ensureDirExists(folder)

    prof.on('exit', function (code) {
      profExited = true
    })

    pump(
      prof.stdout,
      fs.createWriteStream(path.join(folder, '.stacks.' + proc.pid + '.out')),
      function (err) {
        if (err) {
          status(err.message)
          ee.emit('error', err)
          return
        }
        debug('dtrace out closed')
      })

    setTimeout(status, 100, 'Profiling')

    if (process.stdin.isPaused()) {
      process.stdin.resume()
      log('\u001b[?25l')
    }
  }

  if (delay) {
    setTimeout(start, delay)
  } else {
    start()
  }

  process.once('SIGINT', analyze)

  function analyze (manual) {
    if (analyze.called) { return }
    analyze.called = true

    if (!prof) {
      debug('Profiling not begun')
      log('No stacks, profiling had not begun\n')
      tidy(args)
      ee.emit('error', Error('0x: Profiling not begun'))
      return 
    }

    if (!manual) {
      debug('Caught SIGINT, generating flamegraph')
      status('Caught SIGINT, generating flamegraph ')
    }

    try { process.kill(proc.pid, 'SIGINT') } catch (e) {}
    try { process.kill(prof.pid, 'SIGINT') } catch (e) {}

    capture(10)
    function capture (attempts) {
      if (!profExited) {
        if (attempts) {
          if (attempts < 5) {
            // desperate, killing prof process
            try { process.kill(prof.pid, 'SIGKILL') } catch (e) {}
          }
          setTimeout(capture, 300, attempts - 1)
        } else {
          status('Unable to find map file!\n')
          debug('Unable to find map file after multiple attempts')
          tidy(args)
          ee.emit('error', Error('0x: Unable to find map file'))
          return
        }
        return
      }
      if (args.profViz) v8ProfFlamegraph(args, {folder, pid: proc.pid}, next)
      else next()
      function next () { 
        var translate = sym({silent: true, pid: proc.pid})

        if (!translate) {
          debug('unable to find map file')
          if (attempts) {
            status('Unable to find map file - waiting 300ms and retrying\n')
            debug('retrying')
            setTimeout(capture, 300, attempts--)
            return
          }
          status('Unable to find map file!\n')
          debug('Unable to find map file after multiple attempts')
          tidy(args)
          ee.emit('error', Error('0x: Unable to find map file'))
          return
        }
        pump(
          fs.createReadStream(folder + '/.stacks.' + proc.pid + '.out'),
          translate,
          fs.createWriteStream(folder + '/stacks.' + proc.pid + '.out')
        )
        pump(
          translate,
          stacksToFlamegraphStream(args, {pid: proc.pid, folder}, null, () => {
            status('')
          })
        )
      }
    }
  }
}
