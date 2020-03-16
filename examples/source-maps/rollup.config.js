const { terser } = require('rollup-plugin-terser')

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
    terser()
  ]
}]