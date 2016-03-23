var fs = require('fs')
var path = require('path')
var spawn = require('child_process').spawn
var which = require('which')
var pump = require('pump')
var split = require('split2')
var sym = require('perf-sym')
var bstr = require('browserify-string')
var through = require('through2')
var convert = require('./stack-convert')
var gen = require('./gen')
var debug = require('debug')('0x')
var log = require('single-line-log').stdout

module.exports = function (args, binary) {
  isSudo(function (sudo) {
    switch (process.platform) {
      // perf:
      case 'linux':
        return linux(args, sudo, binary)
      // unsupported, but.. xperf? intel vtune?
      case 'win32':
        return unsupported()
      // dtrace: darwin, freebsd, sunos, smartos...
      default:
        return sun(args, sudo, binary)
    }
  })
}

function getProfileFolderName(args, proc) {
  var name = 'profile-' + proc.pid

  if (args['timestamp-profiles']) {
    name += '-' + Date.now()
  }

  return name
}

function sun (args, sudo, binary) {
  var dtrace = pathTo('dtrace')
  var profile = path.join(__dirname, 'node_modules', '.bin', 'profile_1ms.d')
  if (!dtrace) return notFound('dtrace')
  if (!sudo) {
    console.log('0x captures stacks using dtrace, which requires sudo access')
    return spawn('sudo', ['true'])
      .on('exit', function () { sun(args, true) })
  }
  var node = binary === 'node' ? pathTo('node') : binary
  var traceInfo = args['trace-info']
  var stacksOnly = args['stacks-only']
  var delay = args.delay || args.d
  delay = parseInt(delay, 10)
  if (isNaN(delay)) { delay = 0 }
  Error.stackTraceLimit = Infinity
  var proc = spawn(node, [
    '--perf-basic-prof',
    '-r', path.join(__dirname, 'soft-exit')
  ].concat(args.node), {
    stdio: 'inherit'
  }).on('exit', function (code) {
    if (code !== 0) {
      tidy()
      process.exit(code)
    }
    analyze(true)
  })
  var folder
  var prof

  function start () {
    prof = spawn('sudo', [profile, '-p', proc.pid])

    if (traceInfo) { prof.stderr.pipe(process.stderr) }

    folder = getProfileFolderName(args, proc)
    fs.mkdirSync(process.cwd() + '/' + folder)

    pump(
      prof.stdout,
      fs.createWriteStream(folder + '/.stacks.' + proc.pid + '.out')
    )

    setTimeout(log, 100, 'Profiling')

    process.stdin.resume()
    process.stdout.write('\u001b[?25l')
  }

  if (delay) {
    setTimeout(start, delay)
  } else {
    start()
  }

  process.once('SIGINT', analyze)

  function analyze(manual) {
    if (analyze.called) { return }
    analyze.called = true

    if (!prof) {
      debug('Profiling not begun')
      console.log('No stacks, profiling had not begun')
      tidy()
      process.exit()
    }

    if (!manual) {
      debug('Caught SIGINT, generating flamegraph')
      log('Caught SIGINT, generating flamegraph ')      
    }

    var clock = spawn(__dirname + '/node_modules/.bin/clockface', {stdio: 'inherit'})
    process.on('uncaughtException', function (e) {
      clock.kill()
      throw e
    })
    process.on('exit', clock.kill)
    try { process.kill(proc.pid, 'SIGINT') } catch (e) {}
    var translate = sym({silent: true, pid: proc.pid})

    if (!translate) {
      log('Unable to find map file!\n')
      debug('unable to find map file')
      tidy()
      process.exit()
    }
    pump(
      fs.createReadStream(folder + '/.stacks.' + proc.pid + '.out'),
      translate,
      stacksOnly === '-'
        ? process.stdout
        : fs.createWriteStream(folder + '/stacks.' + proc.pid + '.out')
    )
    if (stacksOnly) {
      return translate.on('end', function () {
        clock.kill()
        process.stdout.write('\u001b[K\n')
        console.log()
        tidy()
        process.exit()
      })
    }
    pump(
      translate,
      split(),
      sink(args, proc.pid, folder, clock)
    )
  }
}

function linux (args, sudo, binary) {
  var perf = pathTo('perf')
  if (!perf) return notFound('perf')

  if (!sudo) {
    console.log('0x captures stacks using perf, which requires sudo access')
    return spawn('sudo', ['true'])
      .on('exit', function () { linux(args, true) })
  }

  var node = binary === 'node' ? pathTo('node') : binary
  var uid = parseInt(Math.random() * 1e9, 10).toString(36)
  var perfdat = '/tmp/perf-' + uid + '.data'
  var traceInfo = args['trace-info']
  var stacksOnly = args['stacks-only']
  var delay = args.delay || args.d
    delay = parseInt(delay, 10)
    if (isNaN(delay)) { delay = 0 }

  var proc = spawn('sudo', [
    'perf',
    'record',
    !traceInfo ? '-q' : '',
    '-e',
    'cpu-clock',
    '-F 1000', // 1000 samples per sec === 1ms profiling like dtrace
    '-g',
    '-o',
    perfdat,
    '--',
    node,
    '--perf-basic-prof',
    '-r', path.join(__dirname, 'soft-exit')
  ].filter(Boolean).concat(args.node), {
    stdio: 'inherit'
  }).on('exit', function (code) {
    if (code !== 0 && code !== 143 && code !== 130) {
      tidy()
      process.exit(code)
    }
    analyze(true)
  })

  var folder = getProfileFolderName(args, proc)
  fs.mkdirSync(process.cwd() + '/' + folder)

  setTimeout(log, delay || 100, 'Profiling')

  process.stdin.resume()
  process.stdout.write('\u001b[?25l')

  process.once('SIGINT', analyze)

  function analyze (manual) {
    if (analyze.called) { return }
    analyze.called = true

    if (!manual) {
      debug('Caught SIGINT, generating flamegraph')
      log('Caught SIGINT, generating flamegraph ')      
    }

    var clock = spawn(__dirname + '/node_modules/.bin/clockface', {stdio: 'inherit'})
    process.on('uncaughtException', function (e) {
      clock.kill()
      throw e
    })
    process.on('exit', clock.kill)
    try { process.kill(proc.pid, 'SIGINT') } catch (e) {}

    var stacks = spawn('sudo', ['perf', 'script', '-i', perfdat])

    if (traceInfo) { stacks.stderr.pipe(process.stderr) }
    var stacksOut = stackLine(stacks, delay)
    pump(
      stacksOut,
      stacksOnly === '-'
        ? process.stdout
        : fs.createWriteStream(folder + '/stacks.' + proc.pid + '.out')
    )
    if (stacksOnly) {
      return stacks.on('exit', function () {
        clock.kill()
        process.stdout.write('\u001b[K\n')
        console.log()
        tidy()
        process.exit()
      })
    }
    stacks.on('exit', function () {
      pump(
        fs.createReadStream(folder + '/stacks.' + proc.pid + '.out'),
        split(),
        sink(args, proc.pid, folder, clock)
      )
    })

  }
}

function stackLine(stacks, delay) {
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

function sink (args, pid, folder, clock) {
  var tiers = args.tiers || args.t
  var langs = args.langs || args.l
  var theme = args.theme
  var exclude = args.exclude || args.x
  var include = args.include
  var preview = args.preview || args.p
  debug('begin rendering')
  return convert(function (err, json) {
    if (err) { throw err }
    debug('converted stacks to intermediate format')
    var title = '0x ' + process.argv.slice(2).join(' ')
    var opts = JSON.stringify({
      theme: theme,
      title: title,
      exclude: exclude,
      include: include
    })
    if (langs) opts.langs = langs
    if (tiers) opts.tiers = tiers
    bstr('require("' + __dirname + '/gen")(' + JSON.stringify(json) + ', ' + opts + ')', {})
      .bundle(function (err, src) {
        if (err) {
          debug(
            'Unable to generate client side code for flamegraph',
            err
          )
        }

        var opts = {
          theme: theme,
          title: title,
          script: src.toString(),
          dir: folder,
          preview: preview,
          exclude: exclude,
          include: include
        }

        if (langs) opts.langs = langs
        if (tiers) opts.tiers = tiers

        fs.writeFileSync(folder + '/stacks.' + pid + '.json', JSON.stringify(json, 0, 2))
        gen(json, opts, function () {
          log('')
          clock.kill()
        }, function () {
          debug('flamegraph generated')

          tidy()
          console.log('file://' + process.cwd() + '/' + folder + '/flamegraph.html', '\n')
          debug('exiting')
          debug('done rendering')
          clock.kill()
          process.exit()
          
        })
      })
  })
}

global.count = 0
function tidy () {
  debug('tidying up')
  process.stdout.write('\u001b[?25h')

  fs.readdirSync('./')
    .filter(function (f) {
      return /isolate-(0x[0-9A-Fa-f]{2,12})-v8\.log/.test(f)
    })
    .forEach(function (f) {
      fs.unlinkSync('./' + f)
    })
}

function pathTo (bin) {
  if (fs.existsSync(bin)) { return bin }
  var path
  try { path = which.sync(bin) } catch (e) {}
  if (!path) { throw Error('Cannot find ' + bin + ' on your system!') }
  return path
}

function notFound (bin) {
  process.exit(~console
    .error('Unable to locate ' + bin + " - make sure it's in your PATH")
  )
}

function unsupported () {
  process.exit(~console
    .error('Windows is not supported, PRs welcome :D')
  )
}

function isSudo (cb) {
  var check = spawn('sudo', ['-n', 'true'])
  check.on('exit', function (code) {
    if (!code) return cb(true)
    cb(false)
  })
}
