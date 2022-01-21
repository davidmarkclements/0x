'use strict'

const SOFT_EXIT_SIGNALS = ['SIGINT', 'SIGTERM']

for (let i = 0; i < SOFT_EXIT_SIGNALS.length; i++) {
  process.on(SOFT_EXIT_SIGNALS[i], process.exit)
}

module.exports = { SOFT_EXIT_SIGNALS }
