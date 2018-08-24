'use strict'
const net = require('net')

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
