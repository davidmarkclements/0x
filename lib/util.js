'use strict'

const { EventEmitter } = require('events')
const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')
const which = require('which')
const debug = require('debug')('0x')
const profLogConvert = require('./prof-log-convert')

module.exports = {
  determineOutputDir: determineOutputDir,
  ensureDirExists: ensureDirExists,
  tidy: tidy,
  pathTo: pathTo,
  isSudo: isSudo,
  noop: noop
}

function determineOutputDir (args, proc) {
  var name = (args.outputDir || '{pid}.0x').replace('{pid}', proc.pid || 'UNKNOWN_PID')
  .replace('{timestamp}', Date.now())
  .replace('{cwd}', args.workingDir)
  .replace('{name}', args.name)

  return path.resolve(args.workingDir, name)
}


function ensureDirExists (path) {
  try {
    fs.accessSync(path)
  } catch (e) {
    if (e.code === 'ENOENT') {
      fs.mkdirSync(path)
    } else {
      throw e
    }
  }
}

function tidy (args) {
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
