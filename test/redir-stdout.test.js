const { resolve } = require('path')
const { test } = require('tap')

test('process.stdout.fd should not be undefined', async t => {
  const zeroEks = require('../')
  const opts = {
    argv: [resolve(__dirname, './fixture/log-stdout-fd.js')],
    workingDir: resolve('./')
  }
  const file = zeroEks(opts)
  t.resolves(file)
  t.end()
})
