const { exec } = require('child_process')
const { test } = require('tap')
const fs = require('fs')

test('should be able to profile commands that expect stdin', async t => {
  return new Promise((resolve, reject) => {
    exec('./cmd.js test/fixture/stdin.js < test/fixture/stdin.js', (error, stdout, stderr) => {
      if (error) return reject(error)
      t.equal(stdout, fs.readFileSync('test/fixture/stdin.js', 'utf8'))
      resolve()
    })
  })
})
