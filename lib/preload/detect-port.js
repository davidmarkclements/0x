'use strict'

const onListen = require('on-net-listen')
const fs = require('fs')
const net = require('net')

onListen(function (addr) {
  this.destroy()
  const port = Buffer.from(addr.port + '')
  fs.writeSync(5, port, 0, port.length)
  signal(5, function () {
    process.exit()
  })
})

function signal (fd, cb) {
  const s = new net.Socket({ fd, readable: true, writable: true })
  s.unref()
  s.on('error', () => {})
  s.on('close', cb)
}
