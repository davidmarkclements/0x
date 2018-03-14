'use strict'

const { spawn } = require('child_process')
const { parse } = require('jsonstream2')
const pump = require('pump')

module.exports = v8LogToTicks

function v8LogToTicks (isolateLogPath) {
  const sp = spawn(process.argv[0], [
    '--prof-process', '--preprocess', '-j', isolateLogPath
  ], {stdio: ['ignore', 'pipe', 'inherit']})
  return new Promise((resolve, reject) => {
    const ticks = []
    const codes = []

    const codeStream = parse('code.*', (code) => {
      codes.push(code)
    })

    pump(sp.stdout, codeStream, (err) => {
      if (err) return reject(err)
    })

    const tickStream = parse('ticks.*', (tick) => {
      const addr = tick.s.filter((n, i) => i % 2 === 0)
      var stack = addr.map((n) => codes[n]).filter(Boolean)
      ticks.push(stack.reverse())
    })

    pump(sp.stdout, tickStream, (err) => {
      if (err) return reject(err)
      resolve(ticks)
    })

    sp.on('exit', (code) => {
      if (code !== 0) return reject(Error('v8 log conversion failed'))
    })
  })
}

// function v8LogToTicks (isolateLogPath) {
//   const { stdout, stderr, status } = spawnSync(process.argv[0], [
//     '--prof-process', '--preprocess', '-j', isolateLogPath
//   ])
//   if (status !== 0) {
//     throw Error('v8 log conversion failed: ', stderr + '', stdout + '')
//   }

//   const data = JSON.parse(stdout)
//   const ticks = data.ticks.map((tick, i) => {
//     const addr = tick.s.filter((n, i) => i % 2 === 0)
//     const offsets = tick.s.filter((n, i) => i % 2 === 1)
//     var stack = addr.map((n) => data.code[n]).filter(Boolean)
//     return stack.reverse()
//   })

//   return ticks
// }
