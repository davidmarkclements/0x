'use strict'

const { test } = require('tap')

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

test('Test typical examples - frontend types from names', function (t) {
  t.equal(getType(init1), 'init')
  t.equal(getType(init2), 'init')
  t.equal(getType(cpp1), 'cpp')
  t.equal(getType(cpp2), 'cpp')
  t.equal(getType(v81), 'v8')
  t.equal(getType(v82), 'v8')
  t.equal(getType(regexp1), 'regexp')
  t.equal(getType(regexp2), 'regexp')
  t.equal(getType(native1), 'native')
  t.equal(getType(native2), 'native')
  t.equal(getType(core1), 'core')
  t.equal(getType(core2), 'core')
  t.equal(getType(deps1), 'deps')
  t.equal(getType(deps2), 'deps')
  t.equal(getType(app1), 'app')
  t.equal(getType(app2), 'app')
  t.equal(getType(inlinable, true), 'inlinable')

  t.end()
})

test('Test awkward edge cases', function (t) {
  t.equal(getType({ name: appUnix, type: 'JS' }), 'app')
  t.equal(getType({ name: appWindows, type: 'JS' }), 'app')
  t.equal(getType({ name: depsEsmWindows, type: 'JS' }), 'deps')
  t.equal(getType({ name: depsCommonUnix, type: 'JS' }), 'deps')
  t.equal(getType({ name: sharedLibUnix, type: 'SHARED_LIB' }), 'cpp')
  t.equal(getType({ name: sharedLibWindows, type: 'SHARED_LIB' }), 'cpp')
  t.equal(getType({ name: regexWindowsPaths, type: 'CODE', kind: 'RegExp' }), 'regexp')

  t.end()
})
