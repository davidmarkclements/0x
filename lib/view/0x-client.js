var electron = require('electron-prebuilt')
var proc = require('child_process')

var child = proc.spawn(electron, ['lib/view/main.js', `file://${__dirname}/index.html`])

child.on('exit', () => {
  process.exit()
})
