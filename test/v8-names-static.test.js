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

const { getProcessedName } = require('./util/classify-frames.js')

test('Test typical examples - backend name transformation', async function (t) {
  t.equal(await getProcessedName(init1), init1.name + ' [INIT]')
  t.equal(await getProcessedName(init2), init2.name + ' [INIT]')
  t.equal(await getProcessedName(cpp1), cpp1.name + ' [SHARED_LIB]')
  t.equal(await getProcessedName(cpp2), cpp2.name + ' [SHARED_LIB]')
  t.equal(await getProcessedName(v81), v81.name + ' [CPP]')
  t.equal(await getProcessedName(v82), v82.name + ' [CODE:BuiltIn]')
  t.equal(await getProcessedName(regexp1), regexp1.name + ' [CODE:RegExp]')
  t.equal(await getProcessedName(regexp2), regexp2.name + ' [CODE:RegExp]')
  t.equal(await getProcessedName(native1), '~' + native1.name)
  t.equal(await getProcessedName(native2), '*(anonymous) [eval]:486:24')
  t.equal(await getProcessedName(core1), '*' + core1.name)
  t.equal(await getProcessedName(core2), '~' + core2.name)
  t.equal(await getProcessedName(deps1), '*' + deps1.name)
  t.equal(await getProcessedName(deps2), '~' + deps2.name)
  t.equal(await getProcessedName(app1), '~' + app1.name)
  t.equal(await getProcessedName(app2), '*' + app2.name)
  t.equal(await getProcessedName(inlinable, true), '~' + inlinable.name + ' [INLINABLE]')

  t.end()
})
