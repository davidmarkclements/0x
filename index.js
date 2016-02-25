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
      case 'linux': return linux(args)
      //unsupported, but.. xperf? intel vtune?
      case 'win32': return unsupported()
      //dtrace: darwin, freebsd, sunos, smartos...
      default: return sun(args, sudo)
    }

  })
}

function sun(args, sudo) {
  var saveStacks = args['save-stacks']
  var dtrace = pathTo('dtrace')
  var profile = path.join(__dirname, 'node_modules', '.bin', 'profile_1ms.d')
  if (!dtrace) return notFound('dtrace')
  var preview = 'preview' in args ? args.preview : true

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
      convert(function (err, json) {
        debug('converted stacks to intermediate format')

        bstr('require("'+ __dirname + '/gen")('+JSON.stringify(json)+')', {}).bundle(function (err, src) {
          if (err) {
            debug(
              'Unable to generate client side code for flamegraph',
              err
            )
          }
          
          fs.writeFileSync(folder + '/stacks.' + proc.pid + '.json', JSON.stringify(json, 0, 2))
          gen(json, {script: src.toString(), dir: folder, preview: preview}, function () {
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
    )

  })

}

function tidy() {
  debug('tidying up')
  process.stdout.write('\u001b[?25h')

  fs.readdirSync('./')
  .filter(function (f) {
    return /isolate-(0x[0-9A-Fa-f]{2,12})-v8\.log|\.stacks.+/.test(f)
  })
  .forEach(function (f) {
    fs.unlinkSync('./' + f)
  })
}

function linux(args) {
  var perf = pathTo('perf')
  if (!perf) return notFound('perf')

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