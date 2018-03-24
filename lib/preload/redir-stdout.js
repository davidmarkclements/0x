'use strict'
const fs = require('fs')
process.stdout.write = ((write) => (chunk, encoding, cb) => {
  if (typeof chunk !== 'string' && !(chunk instanceof Buffer)) {
    throw new TypeError(
      'Invalid data, chunk must be a string or buffer, not ' + typeof chunk);
  }
  if (typeof encoding === 'function') {
    cb = encoding
  }
  fs.writeSync(3, chunk)
  if (typeof cb === 'function') cb()
  return true
})(process.stdout.write.bind(process.stdout))
