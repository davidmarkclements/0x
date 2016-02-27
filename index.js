var fs = require('fs')
var path = require('path')
var spawn = require('child_process').spawn
var which = require('which')
var pump = require('pump')
var split = require('split2')
var eos = require('end-of-stream')
var sym = require('perf-sym')
var bstr = require('browserify-string')
var convert = require('./stack-convert')
var gen = require('./gen')
var debug = require('debug')('0x')
var log = require('single-line-log').stdout

module.exports = function (args) {
  isSudo(function (sudo) {

    switch(process.platform) {
      //perf: 
      case 'linux': return linux(args, sudo)
      //unsupported, but.. xperf? intel vtune?
      case 'win32': return unsupported()
      //dtrace: darwin, freebsd, sunos, smartos...
      default: return sun(args, sudo)
    }

  })
}

function sun(args, sudo) {
  var dtrace = pathTo('dtrace')
  var profile = path.join(__dirname, 'node_modules', '.bin', 'profile_1ms.d')
  if (!dtrace) return notFound('dtrace')

  if (!sudo) {
    console.log('0x captures stacks using dtrace, which requires sudo access')
    return spawn('sudo', ['true'])
      .on('exit', function () { sun(args, true) })
  }

  var proc = spawn('node', [
      '--perf-basic-prof', 
      '-r', path.join(__dirname, 'soft-exit')
    ].concat(args.node), {
      stdio: 'inherit'
    }).on('exit', function (code) {
      if (code !== 0) {
        tidy()
        process.exit(code)
      }
    })

  var prof = spawn('sudo', [profile, '-p', proc.pid])
  var folder = 'profile-' + proc.pid
  fs.mkdirSync(process.cwd() + '/' + folder)

  pump(
    prof.stdout, 
    fs.createWriteStream(folder + '/.stacks.' + proc.pid + '.out') 
  )

  setTimeout(log, 100, 'Profiling')

  process.stdin.resume()
  process.stdout.write('\u001b[?25l')

  process.on('SIGINT', function () {
    debug('Caught SIGINT, generating flamegraph')
    log('Caught SIGINT, generating flamegraph ')

    var clock = spawn(__dirname + '/node_modules/.bin/clockface', {stdio: 'inherit'})

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
      fs.createWriteStream(folder + '/stacks.' + proc.pid + '.out')
    )
    pump(
      translate,
      split(),
      sink(args, proc.pid, folder, clock)
    )
  })
}

function linux(args, sudo) {
  var perf = pathTo('perf')
  if (!perf) return notFound('perf')

  if (!sudo) {
    console.log('0x captures stacks using perf, which requires sudo access')
    return spawn('sudo', ['true'])
      .on('exit', function () { linux(args, true) })
  }

  var uid = parseInt(Math.random()*1e9).toString(36)
  var perfdat = '/tmp/perf-' + uid + '.data'

  var proc = spawn('sudo', [
    'perf',
    'record',
    '-e',
    'cpu-clock',
    '-F 1000', //1000 samples per sec === 1ms profiling like dtrace
    '-g',
    '-o',
    perfdat,
    '--',
    'node',
    '--perf-basic-prof', 
    '-r', path.join(__dirname, 'soft-exit')
  ].concat(args.node), {
    stdio: 'inherit'
  }).on('exit', function (code) {
    if (code !== 0) {
      tidy()
      process.exit(code)
    }
  })  

  var folder = 'profile-' + proc.pid
  fs.mkdirSync(process.cwd() + '/' + folder)

  setTimeout(log, 100, 'Profiling')

  process.stdin.resume()
  process.stdout.write('\u001b[?25l')

  process.on('SIGINT', function () {
    debug('Caught SIGINT, generating flamegraph')
    log('Caught SIGINT, generating flamegraph ')

    var clock = spawn(__dirname + '/node_modules/.bin/clockface', {stdio: 'inherit'})
    process.on('unCaughtException', clock.kill)

    try { process.kill(proc.pid, 'SIGINT') } catch (e) {}


    var stacks = spawn('sudo', ['perf', 'script', '-i', perfdat])

    pump(
      stacks.stdout,
      fs.createWriteStream(folder + '/stacks.' + proc.pid + '.out')
    )
    pump(
      stacks.stdout,
      split(),
      sink(args, proc.pid, folder, clock)
    )
  })
}




function sink (args, pid, folder, clock) {
  var tiers = args.tiers || args.t
  var langs = args.langs || args.l
  var exclude = args.exclude || args.x
  var include = args.include
  var preview = 'preview' in args ? args.preview : true

  return convert(function (err, json) {
    debug('converted stacks to intermediate format')
    var title = '0x ' + process.argv.slice(2).join(' ')
    var opts = JSON.stringify({
      title: title,
      exclude: exclude,
      include: include
    })
    if (langs) opts.langs = langs
    if (tiers) opts.tiers = tiers
    bstr('require("'+ __dirname + '/gen")(' + JSON.stringify(json) +', ' + opts + ')', {})
      .bundle(function (err, src) {
        if (err) {
          debug(
            'Unable to generate client side code for flamegraph',
            err
          )
        }

        var opts = {
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
          process.exit()
        })
      })
  })
}

function tidy() {
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


function pathTo(bin) {
  var path
  try { path = which.sync(bin) } catch (e) {}
  return path
}


function notFound(bin) {
  process.exit(~
    console.error('Unable to locate ' + bin + ' - make sure it\'s in your PATH')
  )
}

function unsupported() {
  process.exit(~
    console.error('Windows is not supported, PRs welcome :D')
  )
}

function isSudo(cb) {
  var check = spawn('sudo', ['-n', 'true'])
  check.on('exit', function(code) {
    if (!code) return cb(true)
    cb(false)
  })
}