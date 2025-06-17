const { resolve } = require('path')
const { test } = require('node:test')
const assert = require('node:assert')

test('process.stdout.fd should not be undefined', async () => {
  const zeroEks = require('../')
  const opts = {
    argv: [resolve(__dirname, './fixture/log-stdout-fd.js')],
    workingDir: resolve('./')
  }
  const file = zeroEks(opts)
  await assert.doesNotReject(file)
})
