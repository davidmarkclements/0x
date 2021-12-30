'use strict'

const fs = require('fs')
const path = require('path')
const { promisify } = require('util')
const { spawn } = require('child_process')
const which = require('which')
const debug = require('debug')('0x')
const execSpawn = require('execspawn')
const envString = require('env-string')
const makeDir = require('make-dir')

module.exports = {
  getTargetFolder, tidy, pathTo, isSudo, noop, spawnOnPort, when
}

function when (ee, evt) {
  return promisify((cb) => ee.once(evt, (...args) => cb(null, ...args)))()
}

function spawnOnPort (cmd, port) {
  if (typeof cmd === 'function') {
    return new Promise((resolve, reject) => {
      cmd(port, err => {
        if (err) reject(err)
        else resolve(0, null)
      })
    })
  }

  const sp = execSpawn(envString(cmd, { PORT: port + '' }), { stdio: 'inherit' })
  return new Promise((resolve, reject) => {
    sp.on('exit', (code, signal) => {
      if (code === 0 || code === null) resolve(code, signal)
      else reject(Object.assign(Error(`onPort command failed with code: ${code}`), { code }))
    })
  })
}

function getTargetFolder ({ outputDir, workingDir, name, pid }) {
  name = (outputDir || '{pid}.0x').replace(/{pid}/g, pid || 'UNKNOWN_PID')
    .replace(/{timestamp}/g, Date.now())
    .replace(/{cwd}/g, workingDir)
    .replace(/{name}/g, name)

  const folder = path.resolve(workingDir, name)
  makeDir.sync(folder)

  return folder
}

function tidy () {
  debug('tidying up')

  fs.readdirSync('.')
    .filter(function (f) {
      return /isolate-(0x[0-9A-Fa-f]{2,12})(-\d+)?(-\d+)?-v8\.log/.test(f)
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
  const check = spawn('sudo', ['-n', 'true'])
  return new Promise((resolve, reject) => {
    check.on('error', reject)
    check.on('exit', function (code) {
      if (!code) return resolve(true)
      resolve(false)
    })
  })
}

function noop () {}
