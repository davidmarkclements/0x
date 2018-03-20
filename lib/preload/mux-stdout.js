'use strict'

process.stdout.write = ((write) => (...args) => {
  if (typeof args[0] === 'string' || args[0] instanceof Buffer) {
    args[0] = '\u0001' + args[0].split('\n').join('\u0001\n')
  }
  return write(...args)
})(process.stdout.write.bind(process.stdout))
