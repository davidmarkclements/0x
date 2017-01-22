var fs = require('fs')
var spawn = require('child_process').spawn
var which = require('which')
var debug = require('debug')('0x:flame-image')

module.exports = function (svg, opts, next, done) {
  var dir = opts.dir || '.'
  debug('checking for convert binary')

  if (!opts.preview) {
    write(svg, dir)
    next()
    done()
    return
  }

  which('convert', function (err, path) {
    if (err) {
      debug('imagemagick is not installed')
      next()
      done()
      return
    }

    write(svg, dir)    

    var background = 'black'
    var args = ['-background', background, '-trim', '-resize',
      'x460', dir + '/flamegraph.svg', dir + '/flamegraph-small.png']

    spawn('convert', args)
      .on('close', function () {
        next()
        spawn('bash', [__dirname + '/imgcat', dir + '/flamegraph-small.png'], {stdio: 'inherit'})
          .on('exit', function (code) {
            done()
          })
      })
  })

  function write (svg, dir) {
    debug('writing svg')
    svg = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n' + svg
    fs.writeFileSync(dir + '/flamegraph.svg', svg)
  }
}
