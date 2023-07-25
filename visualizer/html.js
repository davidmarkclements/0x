'use strict'

const fs = require('fs')
const { promisify } = require('util')
const { dirname, join } = require('path')
const tachyons = fs.readFileSync(join(dirname(require.resolve('tachyons')), 'tachyons.min.css'))
const writeFile = promisify(fs.writeFile)
const stdoutWrite = promisify(process.stdout.write.bind(process.stdout))

module.exports = html

function html (opts) {
  const { htmlPath, script } = opts
  const stdout = (opts.htmlPath === '-' || !opts.htmlPath)

  const content = `
    <html>
    <head>
      <meta charset="utf-8">
      <style> ${tachyons} </style>
      <style>
        button:focus { outline:0; }
        rect:hover {opacity: 0.9}

        :root {
          --background: white;
        }
        @media (prefers-color-scheme: dark) {
          :root {
            --background: #000;
          }
        }
        .background {
          background: var(--background);
        }
      </style>
    </head>
    <body class='m0 background sans-serif overflow-hidden'>
      <script> ${script} </script>
    </body>
    </html>
  `
  return stdout ? stdoutWrite(content) : writeFile(htmlPath, content)
}
