'use strict'

Error.stackTraceLimit = Infinity
try {
  throw new Error()
} catch (err) {
  process.nextTick(() => {
    Error.stackTraceLimit = 2
    try {
      throw new Error()
    } catch (innerErr) {
      const filterNextTick = innerErr.stack.split('\n')[2].match(/ \(.+?:/g)[0].slice(2)
      const stacks = err.stack
        .match(/ \(.+?:/g)
        .map((e) => e.slice(2))
        // Filter Everything that has nothing to do with Node core and next
        // ticks.
        .filter((e) => e[0] !== '/' && e[0] !== '\\' && e !== filterNextTick)
      let regExpStr = ''
      let separator = ''
      for (const frame of new Set(stacks)) {
        regExpStr += `${separator} ${frame.replace(/\\/g, '\\\\').replace(/\./g, '\\.')}\\d+:\\d+`
        separator = '|'
      }
      // Newer Node.js versions can expose no non-internal loading frames in
      // this deliberately short stack. Keep the expression valid, but make
      // it match nothing; init-frame labelling is optional and must not
      // prevent conversion of collected ticks into a flamegraph.
      regExpStr = regExpStr ? `${regExpStr}$` : '$^'
      console.log(regExpStr)
    }
  })
}
