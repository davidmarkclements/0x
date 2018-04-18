'use strict'

const fs = require('fs')

module.exports = traceStacksToTicks

function splitBufferOnNewlines (buf) {
  const splitChar = '\n'
  let lines = []
  let searchStart = 0
  let newlineIx
  while ((newlineIx = buf.indexOf(splitChar, searchStart)) !== -1) {
    lines.push(buf.toString('utf8', searchStart, newlineIx))
    searchStart = newlineIx + 1
  }

  return lines
}

function traceStacksToTicks (stacksPath) {
  const header = /(.+):(.+): ?$/
  let n = -1

  /* File size might exceed JS maximum string length, so cannot toString() directly. */
  const stacks = splitBufferOnNewlines(fs.readFileSync(stacksPath))
    .reduce((stacks, line) => {
      if (header.test(line)) {
        n += 1
        return stacks
      }
      if (!line) return stacks
      stacks[n] = stacks[n] || []
      
      stacks[n].unshift({name: line.trim().replace(/^LazyCompile:|Function:|Script:/, '')})
      return stacks
    }, [])

  return stacks
}
