'use strict'

const { spawnSync } = require('child_process')

module.exports = v8LogToTickStacks

function v8LogToTickStacks (isolateLogPath) {
  const { stdout, stderr, status } = spawnSync(process.argv[0], [
    '--prof-process', '--preprocess', '-j', isolateLogPath
  ])
  if (status !== 0) {
    throw Error('v8 log conversion failed: ', stderr + '', stdout + '')
  }

  const data = JSON.parse(stdout)
  const stacks = data.ticks.map((tick, i) => {
    const addr = tick.s.filter((n, i) => i % 2 === 0)
    const offsets = tick.s.filter((n, i) => i % 2 === 1)
    var stack = addr.map((n) => data.code[n]).filter(Boolean)
    return stack.reverse()
  })


  return stacks
}