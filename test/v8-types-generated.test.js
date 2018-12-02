'use strict'

const { test } = require('tap')

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
test('Ensure eval sanitising works as expected before using fixture', function (t) {
  t.throws(function () {
    evalSafeString("'some string'; console.log('>>> Do bad things');")
  }, { actual: 2, expected: 1 })

  t.throws(function () {
    evalSafeString("'some string' + console.log('>>> Do bad things');")
  }, { actual: 'BinaryExpression', expected: 'Literal' })

  t.throws(function () {
    evalSafeString("`some string${ console.log('>>> Do bad things') }`") // eslint-disable-line
  }, { actual: 'TemplateLiteral', expected: 'Literal' })

  // Simulate redefining 'RegExp' to be malicious when it is called later by an innocent 'new RegExp()'
  t.throws(function () {
    evalSafeString("function RegExp () { console.log('>>> Do bad things') }")
  }, { actual: 'FunctionDeclaration', expected: 'ExpressionStatement' })

  t.throws(function () {
    evalSafeString("RegExp = function () { console.log('>>> Do bad things') }")
  }, { actual: 'AssignmentExpression', expected: 'Literal' })

  t.throws(function () {
    evalSafeString("`some string${ function RegExp () { console.log('>>> Do bad things') } }`") // eslint-disable-line
  }, { actual: 'TemplateLiteral', expected: 'Literal' })

  t.throws(function () {
    evalSafeString("'/abc/' && (RegExp = function () { console.log('>>> Do bad things') })")
  }, { actual: 'LogicalExpression', expected: 'Literal' })

  t.throws(function () {
    evalSafeString("(RegExp = function () { console.log('>>> Do bad things') }) && '/abc/'")
  }, { actual: 'LogicalExpression', expected: 'Literal' })

  // Test regex creation
  t.throws(function () {
    evalSafeRegexDef("'/abc'; console.log('>>> Do bad things');")
  }, { actual: 2, expected: 1 })

  t.throws(function () {
    evalSafeRegexDef("'/abc' + console.log('>>> Do bad things')")
  }, { actual: 'BinaryExpression', expected: 'Literal' })

  t.throws(function () {
    evalSafeRegexDef("(RegExp = function () { console.log('>>> Do bad things') }) && '/abc/'")
  }, { actual: 'LogicalExpression', expected: 'Literal' })

  t.throws(function () {
    evalSafeRegexDef("'/abc/' && (RegExp = function () { console.log('>>> Do bad things') })")
  }, { actual: 'LogicalExpression', expected: 'Literal' })

  t.throws(function () {
    evalSafeRegexDef("`/abc${ console.log('>>> Do bad things') }/`") // eslint-disable-line
  }, { actual: 'TemplateLiteral', expected: 'Literal' })

  t.throws(function () {
    evalSafeRegexDef("`/abc${ function RegExp () { console.log('>>> Do bad things') } }/`") // eslint-disable-line
  }, { actual: 'TemplateLiteral', expected: 'Literal' })

  t.end()
})

test('Generate profile and test its output', async function (t) {
  const readFile = promisify(fs.readFile)
  let dir
  const cleanup = function () {
    if (dir) {
      t.ok(fs.existsSync(dir))
      rimraf.sync(dir)
      t.notOk(fs.existsSync(dir))
    }
    t.end()
  }
  const onError = function (err) {
    cleanup()
    throw err
  }

  const htmlLink = await zeroX({
    argv: [ resolve(__dirname, './fixture/do-eval.js') ],
    workingDir: resolve('./')
  }).catch(onError)

  const htmlFile = htmlLink.replace(/^file:\/\//, '')

  // Test 0x output exists as expected
  t.ok(htmlFile.includes('flamegraph.html'))
  t.ok(fs.existsSync(htmlFile))
  t.ok(fs.statSync(htmlFile).size > 10000)

  dir = htmlFile.replace('flamegraph.html', '')
  const jsonFile = fs.readdirSync(dir).find(name => name.match(/\.json$/))

  const content = await readFile(path.resolve(dir, jsonFile)).catch(onError)

  const jsonArray = JSON.parse(content).code

  const app = jsonArray.find(item => item.name.match(/^appOuterFunc /))
  const appUnicode = jsonArray.find(item => item.name.match(/^doFunc.+μИاκهよΞ[/\\]unicode-in-path\.js/))
  const appLongMethod = jsonArray.find(item => item.type === 'JS' && item.name.match(/^method: \\μИاκهよΞ\\ \[CODE:RegExp] \/ native \/ \[SHARED_LIB]/))

  const deps = jsonArray.find(item => item.name.match(/node_modules[/\\]debounce/))

  // We get into multi-level escape character hell if we try to escape then match against the original strings
  // Duplicate stubs long enough to check it's a) correctly classified, and b) unicode etc isn't mangled
  const matchRegexPaths = /^\/D:\u005cDocuments and Settings\u005cАлександра ǂǐ-sì\u005cinternal\u005capp native internal\u005cnode_modules\u005csome-module\u005cesm.mjs:1:1/
  const regexPaths = jsonArray.find(item => item.name.match(matchRegexPaths))
  const matchRegexNonPath = /^\/\[\/\u005c] \.js native \.mjs \u005c \/ :\u005c \/ \u005c \u005c\u005cserver \(\u005cusers\u005cu2fan\u005cnode_modules\u005c\|\/node_modules\/\) \[eval].js:1:2/
  const regexNonPath = jsonArray.find(item => item.name.match(matchRegexNonPath))

  const evalFunc = jsonArray.find(item => item.type === 'JS' && item.name.match(/^evalInnerFunc /))

  // Test 0x json contents are logged and classified as expected
  t.ok(app)
  t.equal(getType(app), 'app')

  t.ok(appUnicode)
  t.equal(getType(appUnicode), 'app')

  t.ok(appLongMethod)
  t.equal(getType(appLongMethod), 'app')

  t.ok(deps)
  t.equal(getType(deps), 'deps')

  t.ok(regexPaths)
  t.equal(getType(regexPaths), 'regexp')

  t.ok(regexNonPath)
  t.equal(getType(regexNonPath), 'regexp')

  t.ok(evalFunc)
  t.equal(getType(evalFunc), 'native')
  t.ok(getProcessedName(evalFunc).includes('[eval]'))

  cleanup()
})
