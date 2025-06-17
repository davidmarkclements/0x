const { exec } = require('child_process')
const { test } = require('node:test')
const assert = require('node:assert')
const fs = require('fs')

test('should be able to profile commands that expect stdin', async () => {
  return new Promise((resolve, reject) => {
    exec('./cmd.js test/fixture/stdin.js < test/fixture/stdin.js', (error, stdout, stderr) => {
      if (error) return reject(error)
      assert.strictEqual(stdout, fs.readFileSync('test/fixture/stdin.js', 'utf8'))
      resolve()
    })
  })
})
