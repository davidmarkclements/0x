'use strict'

const fs = require('fs')

module.exports = traceStacksToTicks

function splitBufferOnNewlines (buf) {
  const splitChar = '\n'
  const lines = []
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

      const name = cleanupStackLine(line)
      stacks[n].unshift({ name, type: getStackType(name) })
      return stacks
    }, [])

  return stacks
}

function cleanupStackLine (line) {
  // match linux perf stack trace
  // eg: 7f587bf53533 Function:^emit node:events:340+0xa13 (/tmp/perf-132082.map)
  const regexCallStack = line.match(/^\s*(\w+)\s*(.+) \((\S*)\)/)
  if (regexCallStack) {
    const rawfunc = regexCallStack[2]
    // Linux 4.8 included symbol offsets in perf script output by default, eg:
    // 7fffb84c9afc cpu_startup_entry+0x800047c022ec ([kernel.kallsyms])
    // strip these off:
    return rawfunc.replace(/\+0x[\da-f]+$/, '').replace(/^LazyCompile:|Function:|Script:|JS:/, '')
  }
  return line
}

function getStackType (name) {
  if (name.match(/^RegExp:/)) {
    return 'CODE:RegExp'
  }
  if (name.match(/::/)) {
    return 'CPP'
  }

  if (name.match(/.*\.js:/) || name.match(/:/)) {
    return 'JS'
  }

  return 'SHARED_LIB'
}
