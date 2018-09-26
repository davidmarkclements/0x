const { test } = require('tap')
const ticksToTree = require('../lib/ticks-to-tree')

// A very small sample
const cryptoTicks = require('./fixtures/crypto-ticks.json')

test('ticksToTree - snapshot', (t) => {
  t.matchSnapshot(ticksToTree(cryptoTicks), 'crypto-ticks')
  t.end()
})
