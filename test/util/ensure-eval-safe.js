'use strict'

const esprima = require('esprima')
const assert = require('assert')

/**
 * Can't be too careful with eval.
 * Check no-one slipped something malicious in the complex strings
 **/

function mainSafetyCheck (parsed, type = 'Literal') {
  // Check there's only one expression
  assert.strictEqual(parsed.body.length, 1)
  // Check it's what we expected
  assert.strictEqual(parsed.body[0].type, 'ExpressionStatement')
  assert.strictEqual(parsed.body[0].expression.type, type)
}

function stringSafetyCheck (str, escapedRegex = false) {
  // Check that when parsed as JS this is nothing but the original string
  const strParsed = esprima.parse(escapeRegex(str))
  mainSafetyCheck(strParsed)

  // expression.value is a string-like object containing the string
  let compare = '' + strParsed.body[0].expression.value

  if (escapeRegex) {
    // Make formats match:
    // - Strip any surrounding " that may have been added to input
    // - Ensure that in a regex, all \\ are \\\\ on both sides
    str = escapeRegex(str.replace(/^"(.*)"$/, '$1'))
    compare = escapeRegex(compare)
  }

  assert.strictEqual(compare, str)
}

function regexSafetyCheck (str) {
  // Check that when parsed as JS in new RegExp(), this is nothing but the expected regex

  const regexParsed = esprima.parse(`new RegExp(${str})`)
  mainSafetyCheck(regexParsed, 'NewExpression')

  assert.strictEqual(regexParsed.body[0].expression.type, 'NewExpression')

  assert.strictEqual(regexParsed.body[0].expression.callee.name, 'RegExp')
  assert.strictEqual(regexParsed.body[0].expression.callee.type, 'Identifier')
  assert.strictEqual(Object.keys(regexParsed.body[0].expression.callee).length, 2)

  assert.strictEqual(regexParsed.body[0].expression.arguments.length, 1)

  assert.strictEqual(regexParsed.body[0].expression.arguments[0].raw, str)

  assert.strictEqual(Object.keys(regexParsed.body[0].expression).length, 3)
}

function evalSafeString (str) {
  stringSafetyCheck(str)
  return str
}

function evalSafeRegexDef (str) {
  const escaped = escapeRegex(str)
  stringSafetyCheck(escaped, true)
  regexSafetyCheck(escaped)
  return escaped
}

function escapeRegex (str) {
  // Each \\ will be treated as an escape character by eval
  return str.replace(/([^\\])\\([^\\])/g, '$1\\\\$2')
}

module.exports = {
  evalSafeString,
  evalSafeRegexDef
}
