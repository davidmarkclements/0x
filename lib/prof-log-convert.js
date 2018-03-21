'use strict'

const { spawnSync } = require('child_process')
const fs = require('fs')

module.exports = profLogConvert

function profLogConvert ({isolateLogPath, pid, folder, stream}, args) {
  const { stdout, stderr, status } = spawnSync('node', ['--prof-process', '--preprocess', '-j', isolateLogPath])

  if (status !== 0) {
    args.status('prof isolateLogPath convert Failed: ', stderr + '', stdout + '')
    return
  }
  const json = isolateLogPath + '.json'
  fs.writeFileSync(json, stdout)
  const data = require(json)

  data.ticks.forEach((tick, i) => {
    const addr = tick.s.filter((n, i) => i % 2 === 0)
    tick.stack = addr.map((n, i) => data.code[n]).filter(Boolean)
    tick.stack = tick.stack.filter(({type}) => type === 'JS')
    if (tick.stack.length === 0) {
      data.ticks[i] = undefined
    }
  })

  data.ticks = data.ticks.filter(Boolean)

  const proc = 'node'
  const profName = 'cpu-clock'
  const space = '              '

  data.ticks.forEach((tick) => {
    stream.write(`${proc} ${pid} ${tick.tm}: ${profName}:\n`)
    stream.write(tick.stack.map(({name, kind}) => {
      if (!name) return 'UKNOWN'
      if (name[0] === ' ') name = '(anonymous)' + name
      if (kind === 'Opt') name = '*' + name
      if (kind === 'Unopt') name = '~' + name
      return space + name
    }).join('\n'))
    stream.write('\n\n')
  })
  stream.end('\n')
}
