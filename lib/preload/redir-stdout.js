'use strict'
const net = require('net')

let isWorker = false
try {
  // Skip redirecting stdout in Worker threads.
  isWorker = !require('worker_threads').isMainThread
} catch (e) {}

if (!isWorker) {
  const socket = new net.Socket({
    fd: 3,
    readable: false,
    writable: true
  })
  Object.defineProperty(process, 'stdout', {
    configurable: true,
    enumerable: true,
    get: () => socket
  })
  Object.defineProperty(process.stdout, 'fd', {
    value: socket._handle.fd
  })
}
