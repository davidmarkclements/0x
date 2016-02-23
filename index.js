var fs = require('fs')
var path = require('path')
var spawn = require('child_process').spawn
var which = require('which')
var pump = require('pump')
var eos = require('end-of-stream')
var concat = require('concat-stream')
var sym = require('perf-sym')
var bstr = require('browserify-string')
var convert = require('./stack-convert')
var gen = require('./gen')

module.exports = function (args) {
  switch(process.platform) {
    //perf: 
    case 'linux': return linux(args)
    //unsupported, but.. xperf? intel vtune?
    case 'win32': return unsupported()
    //dtrace: darwin, freebsd, sunos, smartos...
    default: return sun(args)
  }
}


function sun(args) {
  var saveStacks = args['save-stacks']
  var dtrace = pathTo('dtrace')
  var profile = path.join(__dirname, 'node_modules', '.bin', 'profile_1ms.d')
  if (!dtrace) return notFound('dtrace')
  var proc = spawn('node', [
      '--perf-basic-prof', 
      '-r', path.join(__dirname, 'soft-exit')
    ].concat(args._), {
      stdio: 'inherit'
    })
  var prof = spawn('sudo', [profile, '-p', proc.pid])


  process.stdin.resume()

  process.on('SIGINT', function () {
    var translate = sym({silent: true, pid: proc.pid})
    pump(
      prof.stdout,
      translate,
      convert(function (json) {
        // bstr('require("./gen")('+json+')', {}).bundle(function (err, src) {
        //   if (err) {
        //     console.error(
        //       'Unable to generate client side code for flamegraph',
        //       err
        //     )
        //   }
          gen(json)//, {script: src.toString()})
        // })
      }),
      function end() {
        fs.readdirSync('./')
          .filter(function (f) {
            return /isolate-(0x[0-9A-Fa-f]{2,12})-v8\.log/.test(f)
          })
          .forEach(function (f) {
            fs.unlinkSync('./' + f)
          })
      }
    )

    // pump(cvt, fs.createWriteStream('stacks.' + proc.pid + '.json'))
    pump(translate, fs.createWriteStream('stacks.' + proc.pid + '.out'))

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

