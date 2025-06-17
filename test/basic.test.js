const { resolve } = require('path')
const { test } = require('node:test')
const assert = require('node:assert')

test('module loads', () => {
  require('../')
  assert.ok(true, '0x loaded')
})

test('accepts different workingDir', async () => {
  const zeroEks = require('../')
  const opts = {
    argv: [resolve(__dirname, './fixture/do-eval.js')],
    workingDir: resolve('./')
  }
  const file = zeroEks(opts)
  await assert.doesNotReject(file)
})
