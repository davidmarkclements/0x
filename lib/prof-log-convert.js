'use strict'

const { spawnSync } = require('child_process')
const fs = require('fs')
const { join, basename } = require('path')
const through = require('through2')


module.exports = profLogConvert

function profLogConvert ({isolateLogPath, pid, folder, stream}, args) {
  const { stdout, stderr, status } = spawnSync('node', ['--prof-process', '--preprocess', '-j', isolateLogPath])

  if (status !== 0) {
    args.log('prof isolateLogPath convert Failed: ', stderr + '', stdout + '')
    return
  }
  const json = isolateLogPath + '.json'
  fs.writeFileSync(json, stdout)
  const data = require(json)
  
  data.ticks.forEach((tick, i) => {
    // tick.ms = Math.round(tick.tm / 1000)
    const addr = tick.s.filter((n, i) => i % 2 === 0)
    const offsets = tick.s.filter((n, i) => i % 2 === 1)
    tick.stack = addr.map((n, i) => data.code[n]).filter(Boolean)
    tick.stack = tick.stack.filter(({type}) => type === 'JS')
    if (tick.stack.length === 0) {
      data.ticks[i] = undefined
      return
    }
  })

  data.ticks = data.ticks.filter(Boolean)

  const proc = 'node'
  const profName = 'v8-perf-1ms'
  const space = '              '
  
  // we want the final (un)optimized compute state of the frame
  // so go and find any frames that eventually get optimized
  const optimized = new Set()   
  data.ticks.forEach((tick) => {
    tick.stack.forEach(({ name, kind }) => {
      if (kind === 'Opt') optimized.add(name)
    })
  })

  data.ticks.forEach((tick) => {
    stream.write(`${proc} ${pid} ${tick.tm}: ${profName}:\n`)
    stream.write(tick.stack.map(({name}) => {
      if (!name) return 'UKNOWN'
      const prefix = optimized.has(name) ? '*' : '~'
      if (name[0] === ' ') name = '(anonymous)' + name
      return space + prefix + name
    }).join('\n'))
    stream.write('\n\n')
  })
  stream.end('\n')
  
}