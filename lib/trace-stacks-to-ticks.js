'use strict'

const fs = require('fs')

module.exports = traceStacksToTicks

function traceStacksToTicks (stacksPath) {
  const header = /(.+):(.+): ?$/
  var n = -1
  const stacks = fs.readFileSync(stacksPath)
    .toString()
    .split('\n')
    .reduce((stacks, line) => {
      if (header.test(line)) {
        n += 1
        return stacks
      }
      if (!line) return stacks
      stacks[n] = stacks[n] || []
      stacks[n].unshift({name: line.trim()})
      return stacks
    }, [])

  return stacks
}
