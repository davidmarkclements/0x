'use strict'

const fs = require('fs')
const { bodyStyle, titleStyle } = require('./style')
const { promisify } = require('util')

const writeFile = promisify(fs.writeFile)
const stdoutWrite = promisify(process.stdout.write.bind(process.stdout))

module.exports = generate

function generate (stacks, opts) {
  const { title, htmlPath, script } = opts
  const stdout = (opts.htmlPath === '-' || !opts.htmlPath)

  const html = `<meta charset="utf-8">
    <h1 style="${titleStyle}"> ${title} </h1>
    <style> ${bodyStyle('white')} </style> 
    <chart></chart>
    <script> ${script} </script>
  `
  return stdout ? stdoutWrite(html) : writeFile(htmlPath, html)
}