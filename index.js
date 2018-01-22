'use strict'

const { sun, linux, windows } = require('./platform')
const { execSync } = require('child_process') 
const { EventEmitter } = require('events')
const once = require('once')

const {
  isSudo,
  silence,
  stacksToFlamegraph,
  createLoggers,
  noop
} = require('./lib/util')

// for thus is how it is pronounced:
function zeroEks (args, binary, cb) {
  if (!Array.isArray(args.argv)) {
    throw Error('0x: argv option is required')
  }
  args.name = args.name || 'flamegraph'
  const { log, status } = createLoggers(args)
  args.log = log 
  args.status = status
  args.ee = new EventEmitter()
  if (cb) cb = once(cb)
  isSudo(function (sudo) {
    switch (process.platform) {
      case 'linux':
        return linux(args, sudo, binary)
      case 'win32':
        return windows(args, sudo, binary)
      default:
        return sun(args, sudo, binary)
    }
  })
  if (typeof cb !== 'function') return
  args.ee.on('done', cb)
  args.ee.on('error', cb)
}

zeroEks.stacksToFlamegraph = (args, cb) => {
  if (cb) cb = once(cb)
  const { log, status } = createLoggers(args)
  args.name = args.name || 'flamegraph'
  args.log = log 
  args.status = status
  args.ee = new EventEmitter()
  stacksToFlamegraph(args)
  if (typeof cb !== 'function') return
  args.ee.on('done', cb)
  args.ee.on('error', cb)
}

module.exports = zeroEks
