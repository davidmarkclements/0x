'use strict'

const fs = require('fs')
const path = require('path')
const { promisify } = require('util')
const { spawn } = require('child_process')
const which = require('which')
const debug = require('debug')('0x')
const execSpawn = require('execspawn')
const envString = require('env-string')

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

  const sp = execSpawn(envString(cmd, {PORT: port + ''}), {stdio: 'inherit'})
  return new Promise((resolve, reject) => {
    sp.on('exit', (code, signal) => {
      if (code === 0 || code === null) resolve(code, signal)
      else reject(Object.assign(Error(`onPort command failed with code: ${code}`), { code })) 
    })
  })
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
