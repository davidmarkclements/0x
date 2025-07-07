'use strict'

const { test } = require('node:test')
const assert = require('node:assert')

const { resolve } = require('path')
const fs = require('fs')
const path = require('path')
const { promisify } = require('util')
const rimraf = require('rimraf')
const zeroX = require('../')

const {
  getProcessedName,
  getType
} = require('./util/classify-frames.js')

const {
  evalSafeRegexDef,
  evalSafeString
} = require('./util/ensure-eval-safe.js')

// Be careful if increasing this test file's run time (currently ~5-12s).
// Tap may intermittently fail with "no plan" or, if plans are added,
// mistaken "incorrect number of tests" errors if run time is > ~25s.

// We only have input from our own module, but still, the strings are complex, check they can't contain surprises
test('Ensure eval sanitising works as expected before using fixture', () => {
  assert.throws(function () {
    evalSafeString("'some string'; console.log('>>> Do bad things');")
  }, { actual: 2, expected: 1 })

  assert.throws(function () {
    evalSafeString("'some string' + console.log('>>> Do bad things');")
  }, { actual: 'BinaryExpression', expected: 'Literal' })

  assert.throws(function () {
    evalSafeString("`some string${ console.log('>>> Do bad things') }`") // eslint-disable-line
  }, { actual: 'TemplateLiteral', expected: 'Literal' })

  // Simulate redefining 'RegExp' to be malicious when it is called later by an innocent 'new RegExp()'
  assert.throws(function () {
    evalSafeString("function RegExp () { console.log('>>> Do bad things') }")
  }, { actual: 'FunctionDeclaration', expected: 'ExpressionStatement' })

  assert.throws(function () {
    evalSafeString("RegExp = function () { console.log('>>> Do bad things') }")
  }, { actual: 'AssignmentExpression', expected: 'Literal' })

  assert.throws(function () {
    evalSafeString("`some string${ function RegExp () { console.log('>>> Do bad things') } }`") // eslint-disable-line
  }, { actual: 'TemplateLiteral', expected: 'Literal' })

  assert.throws(function () {
    evalSafeString("'/abc/' && (RegExp = function () { console.log('>>> Do bad things') })")
  }, { actual: 'LogicalExpression', expected: 'Literal' })

  assert.throws(function () {
    evalSafeString("(RegExp = function () { console.log('>>> Do bad things') }) && '/abc/'")
  }, { actual: 'LogicalExpression', expected: 'Literal' })

  // Test regex creation
  assert.throws(function () {
    evalSafeRegexDef("'/abc'; console.log('>>> Do bad things');")
  }, { actual: 2, expected: 1 })

  assert.throws(function () {
    evalSafeRegexDef("'/abc' + console.log('>>> Do bad things')")
  }, { actual: 'BinaryExpression', expected: 'Literal' })

  assert.throws(function () {
    evalSafeRegexDef("(RegExp = function () { console.log('>>> Do bad things') }) && '/abc/'")
  }, { actual: 'LogicalExpression', expected: 'Literal' })

  assert.throws(function () {
    evalSafeRegexDef("'/abc/' && (RegExp = function () { console.log('>>> Do bad things') })")
  }, { actual: 'LogicalExpression', expected: 'Literal' })

  assert.throws(function () {
    evalSafeRegexDef("`/abc${ console.log('>>> Do bad things') }/`") // eslint-disable-line
  }, { actual: 'TemplateLiteral', expected: 'Literal' })

  assert.throws(function () {
    evalSafeRegexDef("`/abc${ function RegExp () { console.log('>>> Do bad things') } }/`") // eslint-disable-line
  }, { actual: 'TemplateLiteral', expected: 'Literal' })
})

test('Generate profile and test its output', async () => {
  const readFile = promisify(fs.readFile)

  const htmlLink = await zeroX({
    argv: [resolve(__dirname, './fixture/do-eval.js')],
    workingDir: resolve('./')
  })

  const htmlFile = htmlLink.replace(/^file:\/\//, '')

  // Test 0x output exists as expected
  assert.ok(htmlFile.includes('flamegraph.html'))
  assert.ok(fs.existsSync(htmlFile))
  assert.ok(fs.statSync(htmlFile).size > 10000)

  const dir = htmlFile.replace('flamegraph.html', '')
  const jsonFile = fs.readdirSync(dir).find(name => name.match(/\.json$/))

  const content = await readFile(path.resolve(dir, jsonFile))

  const jsonArray = JSON.parse(content).code

  const app = jsonArray.find(item => item.name.match(/^appOuterFunc /))
  const appUnicode = jsonArray.find(item => item.name.match(/^doFunc.+μИاκهよΞ[/\\]unicode-in-path\.js/))
  // const appLongMethod = jsonArray.find(item => item.type === 'JS' && item.name.match(/^method: wlμИاκهよΞ\\ \[CODE:RegExp] \/ native \/ \[SHARED_LIB]/))
  const appLongMethod = jsonArray.find(item => item.type === 'JS' && item.name.match(/^method: \[CODE:RegExp] \/ native \/ \[SHARED_LIB]/))
  jsonArray.filter(item => item.type === 'JS')

  const deps = jsonArray.find(item => item.name.match(/node_modules[/\\]debounce/))

  // We get into multi-level escape character hell if we try to escape then match against the original strings
  // Duplicate stubs long enough to check it's a) correctly classified, and b) unicode etc isn't mangled
  const matchRegexPaths = /\/D:\u005cDocuments and Settings\u005cАлександра ǂǐ-sì\u005cinternal\u005capp native internal\u005cnode_modules\u005csome-module\u005cesm.mjs:1:1/
  const regexPaths = jsonArray.find(item => item.name.match(matchRegexPaths))
  const matchRegexNonPath = /\/\[\/\u005c] \.js native \.mjs \u005c \/ :\u005c \/ \u005c \u005c\u005cserver \(\u005cusers\u005cu2fan\u005cnode_modules\u005c\|\/node_modules\/\) \[eval].js:1:2/
  const regexNonPath = jsonArray.find(item => item.name.match(matchRegexNonPath))

  const evalFunc = jsonArray.find(item => item.type === 'JS' && item.name.match(/^evalInnerFunc /))

  // Test 0x json contents are logged and classified as expected
  assert.ok(app)
  assert.strictEqual(getType(app), 'app')

  assert.ok(appUnicode)
  assert.strictEqual(getType(appUnicode), 'app')

  assert.ok(appLongMethod)
  assert.strictEqual(getType(appLongMethod), 'app')

  assert.ok(deps)
  assert.strictEqual(getType(deps), 'deps')

  assert.ok(regexPaths)
  assert.strictEqual(getType(regexPaths), 'regexp')

  assert.ok(regexNonPath)
  assert.strictEqual(getType(regexNonPath), 'regexp')

  assert.ok(evalFunc)
  assert.strictEqual(getType(evalFunc), 'native')
  assert.ok(getProcessedName(evalFunc).includes('[eval]'))

  // Cleanup
  if (dir) {
    assert.ok(fs.existsSync(dir))
    rimraf.sync(dir)
    assert.ok(!fs.existsSync(dir))
  }
})
