const { resolve } = require('path')
const { test } = require('tap')

test('module loads', function (t) {
  require('../')
  t.pass('0x loaded')
  t.end()
})

test('accepts different workingDir', async t => {
  const zeroEks = require('../')
  const opts = {
    argv: [ resolve(__dirname, './fixture/do-eval.js') ],
    workingDir: resolve('../test.0x')
  }
  const file = zeroEks(opts)
  t.resolves(file)
  t.end()
})
