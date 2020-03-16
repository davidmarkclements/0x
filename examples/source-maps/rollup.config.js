const { terser } = require('rollup-plugin-terser')
const { copyFileSync } = require('fs')

const after = () => {
  return {
    generateBundle (outputOptions, bundle, isWrite) {
      setTimeout(() => {
        copyFileSync('./index1.min.js.map', './index2.min-map.js')
      }, 1)
    }
  }
}

module.exports = [{
  input: '../simple/index.js',
  output: {
    file: './index1.min.js',
    format: 'cjs',
    sourcemap: true
  },
  plugins: [
    terser()
  ]
}, {
  input: '../simple/index.js',
  output: {
    file: './index2.min.js',
    format: 'cjs',
    sourcemap: false
  },
  plugins: [
    terser(),
    after()
  ]
}]
