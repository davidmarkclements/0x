'use strict'

const { test } = require('node:test')
const assert = require('node:assert')

const {
  init1,
  init2,
  cpp1,
  cpp2,
  v81,
  v82,
  regexp1,
  regexp2,
  native1,
  native2,
  core1,
  core2,
  deps1,
  deps2,
  app1,
  app2,
  inlinable
} = require('./util/type-simple-cases.js')

const { getProcessedName } = require('./util/classify-frames.js')

test('Test typical examples - backend name transformation', () => {
  assert.strictEqual(getProcessedName(init1), init1.name + ' [INIT]')
  assert.strictEqual(getProcessedName(init2), init2.name + ' [INIT]')
  assert.strictEqual(getProcessedName(cpp1), cpp1.name + ' [SHARED_LIB]')
  assert.strictEqual(getProcessedName(cpp2), cpp2.name + ' [SHARED_LIB]')
  assert.strictEqual(getProcessedName(v81), v81.name + ' [CPP]')
  assert.strictEqual(getProcessedName(v82), v82.name + ' [CODE:BuiltIn]')
  assert.strictEqual(getProcessedName(regexp1), regexp1.name + ' [CODE:RegExp]')
  assert.strictEqual(getProcessedName(regexp2), regexp2.name + ' [CODE:RegExp]')
  assert.strictEqual(getProcessedName(native1), '~' + native1.name)
  assert.strictEqual(getProcessedName(native2), '*(anonymous) [eval]:486:24')
  assert.strictEqual(getProcessedName(core1), '*' + core1.name)
  assert.strictEqual(getProcessedName(core2), '~' + core2.name)
  assert.strictEqual(getProcessedName(deps1), '*' + deps1.name)
  assert.strictEqual(getProcessedName(deps2), '~' + deps2.name)
  assert.strictEqual(getProcessedName(app1), '~' + app1.name)
  assert.strictEqual(getProcessedName(app2), '*' + app2.name)
  assert.strictEqual(getProcessedName(inlinable, true), '~' + inlinable.name + ' [INLINABLE]')
})
