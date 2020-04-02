const { test } = require('tap')
const zeroX = require('../')
const { promisify } = require('util')
const fs = require('fs')
const { resolve } = require('path')
const path = require('path')
const rimraf = require('rimraf')

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
    treeDebug: true,
    sourceMaps: true
  }).catch(onError)

  const htmlFile = htmlLink.replace(/^file:\/\//, '')

  dir = htmlFile.replace('flamegraph.html', '')
  const jsonFile = fs.readdirSync(dir).find(name => name.match(/\.json$/))

  const content = await readFile(path.resolve(dir, jsonFile)).catch(onError)

  const jsonArray = JSON.parse(content).functions

  // Check the line number by matching known fn name
  const fnObj = jsonArray.filter(function (obj) {
    return obj.name.includes('testInterval')
  })
  const numRegex = /[-]{0,1}[\d]*[.]{0,1}[\d]+/g
  const str = fnObj[0].name.substring(fnObj[0].name.indexOf('.js:'), fnObj[0].name.length)
  console.log(str.match(numRegex))

  cleanup()
})
