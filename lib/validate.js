'use strict'

const Ajv = require('ajv')
const ajv = new Ajv()

module.exports = (schema) => {
  return validate

  function validate (args) {
    const onPortFn = typeof args.onPort === 'function' && args.onPort
    if (onPortFn) delete args.onPort

    const privateProps = {
      workingDir: { type: 'string' }
    }
    const valid = ajv.compile({
      ...schema,
      properties: { ...schema.properties, ...privateProps }
    }
    )
    if (valid(args)) {
      if (onPortFn) args.onPort = onPortFn
      return
    }
    const [{ keyword, dataPath, params, message }] = valid.errors
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
