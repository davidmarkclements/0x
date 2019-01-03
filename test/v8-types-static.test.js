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

test('Test typical examples - frontend types from names', async function (t) {
  t.equal(await getType(init1), 'init')
  t.equal(await getType(init2), 'init')
  t.equal(await getType(cpp1), 'cpp')
  t.equal(await getType(cpp2), 'cpp')
  t.equal(await getType(v81), 'v8')
  t.equal(await getType(v82), 'v8')
  t.equal(await getType(regexp1), 'regexp')
  t.equal(await getType(regexp2), 'regexp')
  t.equal(await getType(native1), 'native')
  t.equal(await getType(native2), 'native')
  t.equal(await getType(core1), 'core')
  t.equal(await getType(core2), 'core')
  t.equal(await getType(deps1), 'deps')
  t.equal(await getType(deps2), 'deps')
  t.equal(await getType(app1), 'app')
  t.equal(await getType(app2), 'app')
  t.equal(await getType(inlinable, true), 'inlinable')

  t.end()
})

test('Test awkward edge cases', async function (t) {
  t.equal(await getType({ name: appUnix, type: 'JS' }), 'app')
  t.equal(await getType({ name: appWindows, type: 'JS' }), 'app')
  t.equal(await getType({ name: depsEsmWindows, type: 'JS' }), 'deps')
  t.equal(await getType({ name: depsCommonUnix, type: 'JS' }), 'deps')
  t.equal(await getType({ name: sharedLibUnix, type: 'SHARED_LIB' }), 'cpp')
  t.equal(await getType({ name: sharedLibWindows, type: 'SHARED_LIB' }), 'cpp')
  t.equal(await getType({ name: regexWindowsPaths, type: 'CODE', kind: 'RegExp' }), 'regexp')

  t.end()
})
