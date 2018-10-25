'use strict'

const { spawn } = require('child_process')
const { parse } = require('jsonstream2')
const { extname } = require('path')
const { promisify } = require('util')
const through = require('through2')
const fs = require('fs')
const pump = require('pump')

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

module.exports = wrapper

async function wrapper (isolateLogPath, node) {
  const filtered = await filterLinesThatAreTooLong(isolateLogPath)
  const normalised = await normalizeWindowsLog(filtered)
  return v8LogToTicks(normalised, node)
}

async function normalizeWindowsLog (isolateLogPath) {
  if (process.platform !== 'win32') return isolateLogPath

  // Only needed because of a V8 tick processor bug that
  // treats C:(\A...) as an escape sequence when parsing the csv file

  const dest = isolateLogPath + '.normalised'
  let data = await readFile(isolateLogPath, 'utf8')
  data = data.split('\n').map(escapePath).join('\n')
  await writeFile(dest, data)
  return dest
}

function escapePath (line) {
  const startPath = line.indexOf(':\\')
  if (startPath === -1) return line
  // \u005c is the unicode escape for the \ char
  return line.slice(0, startPath) + line.slice(startPath).replace(/([^\\])\\([^\\]|$)/g, '$1\\u005c$2')
}

// long lines make the --preprocess crash. We are just filtering them beforehand
// as Node.js 8.12.0 would crash if there is any error in the preprocess script
// TODO use streams
async function filterLinesThatAreTooLong (isolateLogPath) {
  const dest = isolateLogPath + '.filtered'
  let data = await readFile(isolateLogPath, 'utf8')
  data = data.split('\n').filter((s) => s.length < 1024).join('\n')
  await writeFile(dest, data)
  return dest
}

function v8LogToTicks (isolateLogPath, node) {
  const isJson = extname(isolateLogPath) === '.json'
  const sp = isJson || spawn(node, [
    '--prof-process', '--preprocess', '-j', isolateLogPath
  ], { stdio: ['ignore', 'pipe', 'pipe'] })
  const close = isJson ? () => {} : () => sp.kill()
  const srcStream = isJson ? fs.createReadStream(isolateLogPath) : sp.stdout
  if (!isJson) {
    // unknown code state errors are mostly harmless,
    // and not fixable within 0x at the moment (because
    // it's an error in the V8 internal tick profiler)
    // ignore them.
    const ignore = /unknown code state:/
    pump(sp.stderr, through((errMsg, _, cb) => {
      if (ignore.test(errMsg)) {
        cb()
      } else {
        cb(errMsg, _, cb)
      }
    }), process.stderr)
  }
  return new Promise((resolve, reject) => {
    const ticks = []
    const codes = []

    const codeStream = parse('code.*', (code) => {
      codes.push(code)
    })

    if (isJson === false) {
      const v8Json = isolateLogPath.replace(extname(isolateLogPath), '.json')
      pump(srcStream, fs.createWriteStream(v8Json), (err) => {
        if (err) {
          reject(err)
          close()
        }
      })
    }

    pump(srcStream, codeStream, (err) => {
      if (!err) return
      if (/^Unexpected/.test(err.message)) {
        reject(Error(codeStream._transformState.writechunk + '' || err.message))
      } else {
        reject(err)
      }
      close()
    })

    const tickStream = parse('ticks.*', (tick) => {
      const addr = tick.s.filter((n, i) => i % 2 === 0)
      var stack = addr.map((n) => codes[n]).filter(Boolean)
      ticks.push(stack.reverse())
    })

    pump(srcStream, tickStream, (err) => {
      if (err) {
        close()
        return reject(err)
      }
      resolve(ticks.filter(Boolean))
    })

    if (isJson === false) {
      sp.on('exit', (code) => {
        if (code !== 0) return reject(Error('v8 log conversion failed'))
      })
    }
  })
}
