'use strict'

const {
  allTags,
  regexWindowsPaths,
  stringPosixPaths,
  nonPathRegex
} = require('../util/type-edge-cases.js')

const {
  evalSafeString,
  evalSafeRegexDef
} = require('../util/ensure-eval-safe.js')

const doFunc = require('./μИاκهよΞ/unicode-in-path.js')

const debounce = require('debounce')

function appOuterFunc () {
  const regexStringTarget = `${allTags} ${regexWindowsPaths} ${stringPosixPaths}`

  const evalCode = `
    function evalInnerFunc () {
      const regex = new RegExp(${evalSafeRegexDef(`"${regexWindowsPaths}"`)})
      return ${evalSafeString(`"${regexStringTarget}"`)}.repeat(100).replace(regex, ${evalSafeString(`"${stringPosixPaths}"`)})
    }
    evalInnerFunc()
  `

  // Long enough for consistent output, not so long test is slow or may time out
  const reps = 120

  const obj = {
    // Method names defined from a variable show up as (anonymous)
    // but crazy method names written in as strings still show up in output
    'method: \\μИاκهよΞ\\ [CODE:RegExp] / native / [SHARED_LIB]': function () {
      global.eval(evalCode) // eslint-disable-line
      regexStringTarget.repeat(reps).replace(new RegExp(nonPathRegex), stringPosixPaths)
    }
  }

  const doEval = function () {
    obj['method: \\μИاκهよΞ\\ [CODE:RegExp] / native / [SHARED_LIB]']()
  }

  for (let i = 0; i < reps; i++) {
    doFunc(doEval)
  }
}

// This debounce wrapper is purely to get a simple stable 'deps' frame in the output
const debounceWrapper = debounce(appOuterFunc, 0, true)
debounceWrapper()
