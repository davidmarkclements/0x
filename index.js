var fs = require('fs')
var path = require('path')
var spawn = require('child_process').spawn
var which = require('which')
var pump = require('pump')
var split = require('split2')
var sym = require('perf-sym')
var through = require('through2')
var convert = require('./stack-convert')
var browserify = require('browserify')
var multistream = require('multistream')
var concat = require('concat-stream')
var gen = require('./gen.js')
var debug = require('debug')('0x')
var status = require('single-line-log').stderr

function log () { process.stderr.write.apply(process.stderr, arguments) }

module.exports = function (args, binary) {
  if (args.q) { log = status = noop }
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
  var name = args['output-dir']

  if (!name) {
    name = 'profile-' + proc.pid
  }

  if (args['timestamp-profiles']) {
    name += '-' + Date.now()
  }

  return path.resolve(process.cwd(), name)
}

function ensureDirExists(path) {
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

function sun (args, sudo, binary) {
  var dtrace = pathTo('dtrace')
  var profile = require.resolve('perf-sym/profile_1ms.d')
  if (!dtrace) return notFound('dtrace')
  if (!sudo) {
    log('0x captures stacks using dtrace, which requires sudo access\n')
    return spawn('sudo', ['true'])
      .on('exit', function () { sun(args, true, binary) })
  }
  var node = !binary || binary === 'node' ? pathTo('node') : binary
  var traceInfo = args['trace-info']
  var stacksOnly = args['stacks-only']
  var delay = args.delay || args.d
  delay = parseInt(delay, 10)
  if (isNaN(delay)) { delay = 0 }

  args = Object.assign([
    '--perf-basic-prof',
    '-r', path.join(__dirname, 'soft-exit')
  ].concat(args.node), args)

  var proc = spawn(node, args, {
    stdio: 'inherit'
  }).on('exit', function (code) {
    if (code !== 0) {
      tidy(args)
      process.exit(code)
    }
    analyze(true)
  })
  var folder
  var prof
  var profExited = false

  function start () {
    prof = spawn('sudo', [profile, '-p', proc.pid])

    if (traceInfo) { prof.stderr.pipe(process.stderr) }

    folder = getProfileFolderName(args, proc)
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
          process.exit(1)
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

  function analyze(manual) {
    if (analyze.called) { return }
    analyze.called = true

    if (!prof) {
      debug('Profiling not begun')
      log('No stacks, profiling had not begun\n')
      tidy(args)
      process.exit()
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
          process.exit(1)
        }
        return
      }

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
        process.exit(1)
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
          log('\u001b[K\n\n')
          tidy(args)
          process.exit()
        })
      }
      pump(
        translate,
        split(),
        sink(args, proc.pid, folder)
      )
    }
  }
}

function linux (args, sudo, binary) {
  var perf = pathTo('perf')
  if (!perf) return notFound('perf')

  if (!sudo) {
    log('0x captures stacks using perf, which requires sudo access\n')
    return spawn('sudo', ['true'])
      .on('exit', function () { linux(args, true, binary) })
  }

  var node = !binary || binary === 'node' ? pathTo('node') : binary
  var uid = parseInt(Math.random() * 1e9, 10).toString(36)
  var perfdat = '/tmp/perf-' + uid + '.data'
  var traceInfo = args['trace-info']
  var stacksOnly = args['stacks-only']
  var delay = args.delay || args.d
    delay = parseInt(delay, 10)
    if (isNaN(delay)) { delay = 0 }

  var proc = spawn('sudo', [
    '-E',
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
      tidy(args)
      process.exit(code)
    }
    analyze(true)
  })

  var folder = getProfileFolderName(args, proc)
  ensureDirExists(folder)

  setTimeout(status, delay || 100, 'Profiling')

  if (process.stdin.isPaused()) {
    process.stdin.resume()
    log('\u001b[?25l')
  }

  process.once('SIGINT', analyze)

  function analyze (manual) {
    if (analyze.called) { return }
    analyze.called = true

    if (!manual) {
      debug('Caught SIGINT, generating flamegraph')
      status('Caught SIGINT, generating flamegraph ')
    }

    try { process.kill(proc.pid, 'SIGINT') } catch (e) {}

    proc.on('exit', function() {
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
          log('\u001b[K\n')
          log('\n')
          tidy(args)
          process.exit()
        })
      }
      stacks.on('exit', function () {
        pump(
          fs.createReadStream(folder + '/stacks.' + proc.pid + '.out'),
          split(),
          sink(args, proc.pid, folder)
        )
      })
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

function sink (args, pid, folder) {
  var tiers = args.tiers || args.t
  var langs = args.langs || args.l
  var theme = args.theme
  var exclude = args.exclude || args.x
  var include = args.include
  var preview = args.preview || args.p
  if (preview) args.svg = true
  var svg = args.svg

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

    multistream([
      browserify({standalone: 'd3'}).add(require.resolve('d3')).bundle(),
      browserify({standalone: 'hsl'}).add(require.resolve('hsl-to-rgb-for-reals')).bundle(),
      browserify({standalone: 'flamer'}).add(path.join(__dirname, './flamer')).bundle(),
      browserify({standalone: 'gen'}).add(path.join(__dirname, './gen')).bundle()
    ]).pipe(concat(function (bundle) {
      write(bundle + '\ngen(' + JSON.stringify(json) + ', ' + opts + ')')
    }))

    function write (src) {
      var opts = {
        theme: theme,
        title: title,
        script: src.toString(),
        dir: folder,
        svg: svg,
        preview: preview,
        exclude: exclude,
        include: include
      }

      if (langs) opts.langs = langs
      if (tiers) opts.tiers = tiers

      fs.writeFileSync(folder + '/stacks.' + pid + '.json', JSON.stringify(json, 0, 2))
      gen(json, opts, function () {
        status('')
      }, function () {
        debug('flamegraph generated')
        tidy(args)
        log('file://' + folder + '/flamegraph.html\n\n')
        debug('exiting')
        debug('done rendering')
        process.exit()
      })
    }
  })
}

global.count = 0
function tidy (args) {
  debug('tidying up')
  log('\u001b[?25h')

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

function noop () {}
