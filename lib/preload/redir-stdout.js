'use strict'
const fs = require('fs')

let isWorker = false
try {
  // Skip redirecting stdout in Worker threads.
  isWorker = !require('worker_threads').isMainThread
} catch (e) {}

if (!isWorker) {
  // fd 3 is a pipe created by the profiler, not a network socket. Older
  // Node versions accepted wrapping it in net.Socket, but Node 24 rejects
  // that with ERR_INVALID_FD_TYPE (the descriptor type is UNKNOWN). A
  // WriteStream is the correct abstraction for this descriptor and retains
  // the process.stdout.fd contract used by profiled applications.
  const stdout = fs.createWriteStream(null, {
    fd: 3,
    autoClose: false
  })
  Object.defineProperty(process, 'stdout', {
    configurable: true,
    enumerable: true,
    get: () => stdout
  })
  Object.defineProperty(process.stdout, 'fd', {
    value: 3
  })
}
