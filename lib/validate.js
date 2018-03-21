'use strict'

const ajv = require('ajv')()

module.exports = (schema) => {
  return validate

  function validate (args) {
    const privateProps = {
      workingDir: {type: 'string'}
    }
    const valid = ajv.compile({
      ...schema,
      properties: {...schema.properties, ...privateProps}
    }
    )
    if (valid(args)) return
    const [{keyword, dataPath, params, message}] = valid.errors
    if (keyword === 'type') {
      const flag = dataPath.substr(
        1,
        dataPath[dataPath.length - 1] === ']'
          ? dataPath.length - 2
          : dataPath.length - 1
      )
      const dashPrefix = flag.length === 1 ? '-' : '--'
      throw Error(`The ${dashPrefix}${flag} option ${message}\n`)
    }
    if (keyword === 'additionalProperties') {
      const flag = params.additionalProperty
      const dashPrefix = flag.length === 1 ? '-' : '--'
      throw Error(`${dashPrefix}${flag} is not a recognized flag\n`)
    }
  }
}
