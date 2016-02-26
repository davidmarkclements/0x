var fs = require('fs')
var spawn = require('child_process').spawn
var exec = require('child_process').exec
var which = require('which')
var debug = require('debug')('0x:flame-image')

module.exports = function (svg, opts, next, done) {
  debug('checking for convert binary')
  which('convert', function (err, path) {
    if (err) { 
      debug('imagemagick is not installed')
      next()
      done()
      return 
    }

    var dir = opts.dir || '.'
    debug('writing svg')
    fs.writeFileSync(dir + '/flamegraph.svg', svg)
    var background = 'black'
    var args = ['-background', background, '-trim', '-resize', 
      'x460', dir + '/flamegraph.svg', dir + '/flamegraph-small.png']

    spawn('convert', args)
      .on('close', function () {
        next()


        debug('checking for iTerm')
        if (process.env.TERM_PROGRAM !== 'iTerm.app') {
          debug('not iTerm')
          console.log(dir + '/flamegraph.svg')
          next()
          done()
          return
        }

        exec('defaults read com.googlecode.iterm2', function (err, stdout, stderr) {
          if (err || stderr) {
            debug('Unable to determine iTerm version')
            console.log(dir + '/flamegraph.svg')
            next()
            done()
            return
          }
          var match = (stdout + '').match(/"iTerm Version" = "(.+)"/)
          if (!match) {
            debug('Unable to determine iTerm version')
            console.log(dir + '/flamegraph.svg')
            next()
            done()
            return
          }
          var version = parseFloat(match[1])
          if (isNaN(version)) {
            debug('Unable to determine iTerm version')
            console.log(dir + '/flamegraph.svg')
            next()
            done()
            return
          }
          if (version < 2.9) {
            debug('iTerm version too low to display image - ' + match[1])
            console.log(dir + '/flamegraph.svg')
            next()
            done()
            return
          }

          spawn('bash', [__dirname + '/imgcat', dir + '/flamegraph-small.png'], {stdio: 'inherit'})
            .on('close', done)
        })
      })
  })
}
