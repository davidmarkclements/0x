const { test } = require('tap')
const zeroX = require('../')
const { promisify } = require('util')
const fs = require('fs')
const { resolve } = require('path')


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
    argv: [ resolve(__dirname, './fixture/sourcemap.min.js') ],
    workingDir: resolve('./'),
    collectOnly: true,
  	treeDebug: true
  }).catch(onError)

cleanup()
})