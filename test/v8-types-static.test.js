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

const {
  regexWindowsPaths,
  sharedLibUnix,
  sharedLibWindows,
  depsEsmWindows,
  depsCommonUnix,
  appUnix,
  appWindows
} = require('./util/type-edge-cases.js')

const { getType } = require('./util/classify-frames.js')

test('Test typical examples - frontend types from names', () => {
  assert.strictEqual(getType(init1), 'init')
  assert.strictEqual(getType(init2), 'init')
  assert.strictEqual(getType(cpp1), 'cpp')
  assert.strictEqual(getType(cpp2), 'cpp')
  assert.strictEqual(getType(v81), 'v8')
  assert.strictEqual(getType(v82), 'v8')
  assert.strictEqual(getType(regexp1), 'regexp')
  assert.strictEqual(getType(regexp2), 'regexp')
  assert.strictEqual(getType(native1), 'native')
  assert.strictEqual(getType(native2), 'native')
  assert.strictEqual(getType(core1), 'core')
  assert.strictEqual(getType(core2), 'core')
  assert.strictEqual(getType(deps1), 'deps')
  assert.strictEqual(getType(deps2), 'deps')
  assert.strictEqual(getType(app1), 'app')
  assert.strictEqual(getType(app2), 'app')
  assert.strictEqual(getType(inlinable, true), 'inlinable')
})

test('Test awkward edge cases', () => {
  assert.strictEqual(getType({ name: appUnix, type: 'JS' }), 'app')
  assert.strictEqual(getType({ name: appWindows, type: 'JS' }), 'app')
  assert.strictEqual(getType({ name: depsEsmWindows, type: 'JS' }), 'deps')
  assert.strictEqual(getType({ name: depsCommonUnix, type: 'JS' }), 'deps')
  assert.strictEqual(getType({ name: sharedLibUnix, type: 'SHARED_LIB' }), 'cpp')
  assert.strictEqual(getType({ name: sharedLibWindows, type: 'SHARED_LIB' }), 'cpp')
  assert.strictEqual(getType({ name: regexWindowsPaths, type: 'CODE', kind: 'RegExp' }), 'regexp')
})
