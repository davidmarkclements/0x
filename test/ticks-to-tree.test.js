const { test } = require('tap')
const ticksToTree = require('../lib/ticks-to-tree')

// A very small sample
const cryptoTicks = require('./fixtures/crypto-ticks.json')

test('ticksToTree - snapshot', async (t) => {
  t.matchSnapshot(await ticksToTree(cryptoTicks), 'crypto-ticks')
  t.end()
})
