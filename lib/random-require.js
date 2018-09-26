'use strict'

// Initialize console
console.log // eslint-disable-line no-unused-expressions

Error.stackTraceLimit = Infinity
throw new Error('Load phase')
