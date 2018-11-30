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
  const normalised = await prepareForPreprocess(isolateLogPath)
  return v8LogToTicks(normalised, node)
}

// 1. Filter because long lines make the --preprocess crash. Filter them beforehand,
//    because Node.js 8.12.0 would crash if there is any error in the preprocess script
// 2. Escape backslashes because V8's --preprocess -j treats \\ as an escape pattern,
//    garbling Windows paths or regular expression definitions that contain it
// TODO use streams
async function prepareForPreprocess (isolateLogPath) {
  const dest = isolateLogPath + '.preprocess-ready'
  let data = await readFile(isolateLogPath, { encoding: 'utf8' })
  data = data.split('\n').filter((s) => s.length < 1024).map(fixLines).join('\n')
  await writeFile(dest, data)
  return dest
}

function fixLines (line) {
  // Work around a bug in Node 10's V8 --preprocess -j that breaks strings containing \\

  // Look for backslashes that aren't escaping a unicode character code, like \\u01a2
  // Small risk of false positives e.g. is C:\\Users\\u2bfab\\ unicode, or a U2 fan?
  // So, catch basic multilingual (4 char) only. No hieroglyphs or ancient Mayan.
  const startPath = line.search(/\\(?!u[0-9A-Fa-f]{4})/)
  if (startPath === -1) return line

  // Replace any \\ that's not part of a unicode escape character
  const replaceRegex = /\\(?!u[0-9A-Fa-f]{4})/g
  // \u005c is the unicode escape for the \ char
  return line.slice(0, startPath) + line.slice(startPath).replace(replaceRegex, '\\u005c')
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
