'use strict'

const { EventEmitter } = require('events')
const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')
const which = require('which')
const debug = require('debug')('0x')
const profLogConvert = require('./prof-log-convert')

module.exports = {
  getTargetFolder, tidy, pathTo, isSudo, noop
}

function getTargetFolder ({outputDir, workingDir, name, pid}) {
  name = (outputDir || '{pid}.0x').replace('{pid}', pid || 'UNKNOWN_PID')
    .replace('{timestamp}', Date.now())
    .replace('{cwd}', workingDir)
    .replace('{name}', name)

  const folder = path.resolve(workingDir, name)

  try {
    fs.accessSync(folder)
  } catch (e) {
    if (e.code === 'ENOENT') {
      fs.mkdirSync(folder)
    } else {
      // function is always used within async/await or promise - fine to throw
      throw e
    }
  }

  return folder
}

function tidy () {
  debug('tidying up')

  fs.readdirSync('.')
    .filter(function (f) {
      return /isolate-(0x[0-9A-Fa-f]{2,12})-v8\.log/.test(f)
    })
    .forEach(function (f) {
      fs.unlinkSync(f)
    })
}

function pathTo (bin) {
  if (fs.existsSync(bin)) { return bin }
  return which.sync(bin)
}

function isSudo () {
  var check = spawn('sudo', ['-n', 'true'])
  return new Promise((resolve, reject) => {
    check.on('error', reject)
    check.on('exit', function (code) {
      if (!code) return resolve(true)
      resolve(false)
    })
  })
}

function noop () {}
