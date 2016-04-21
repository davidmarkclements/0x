var electron = require('electron-prebuilt')
var proc = require('child_process')

exports.start = function start (path) {
  var child = proc.spawn(electron, ['lib/view/main.js', path])

  child.on('exit', () => {
    process.exit()
  })
}
