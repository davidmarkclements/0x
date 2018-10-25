const { test } = require('tap')

test('module loads', function (t) {
  require('../')
  t.pass('0x loaded')
  t.end()
})
