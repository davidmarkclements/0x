'use strict'

const fs = require('fs')
const events = require('events')
const cluster = require('cluster')
const net = require('net')

// Observe Server instances directly. Node 24 no longer assigns the owner
// property to TCPSERVERWRAP resources, which breaks on-net-listen's
// async_hooks implementation.
const onListen = function (onlistening) {
  const e = new events.EventEmitter()
  const originalListen = net.Server.prototype.listen

  function listen (...args) {
    this.once('listening', function () {
      const addr = this.address()
      if (addr) e.emit('listening', addr)
    })
    return originalListen.apply(this, args)
  }

  net.Server.prototype.listen = listen
  cluster.on('listening', oncluster)
  e.destroy = destroy

  if (onlistening) e.on('listening', onlistening)

  return e

  function destroy () {
    if (net.Server.prototype.listen === listen) {
      net.Server.prototype.listen = originalListen
    }
    cluster.removeListener('listening', oncluster)
  }

  function oncluster (_, addr) {
    e.emit('listening', addr)
  }
}

onListen(function (addr) {
  this.destroy()
  const port = Buffer.from(addr.port + '')
  fs.writeSync(5, port, 0, port.length)
  signal(5, function () {
    process.exit()
  })
})

function signal (fd, cb) {
  const stream = fs.createReadStream(null, { fd })
  stream.on('error', () => {})
  stream.on('end', cb)
  stream.resume()
}
