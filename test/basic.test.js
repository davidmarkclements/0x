const { resolve } = require('path')
const { test } = require('node:test')
const assert = require('node:assert')
const { spawn } = require('node:child_process')
const fs = require('fs')

async function spawnAsync (cmd, args, options) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, options)
    let output = ''
    child.stdout?.on('data', (data) => {
      output += data.toString()
    })

    child.stderr?.on('data', (data) => {
      output += data.toString()
    })

    child.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`Command failed with exit code ${code}: ${output}`))
      }
      resolve(output)
    })
    child.on('error', (err) => {
      reject(err)
    })
  })
}

test('module loads', () => {
  require('../')
  assert.ok(true, '0x loaded')
})

test('accepts different workingDir', async () => {
  const zeroEks = require('../')
  const opts = {
    argv: [resolve(__dirname, './fixture/do-eval.js')],
    workingDir: resolve('./')
  }
  const file = zeroEks(opts)
  await assert.doesNotReject(file)
})

test('sets default workingDir when cmd.js is run', async t => {
  const workingDir = fs.mkdtempSync('0x')
  const cmdPath = resolve(__dirname, '../cmd.js')
  await spawnAsync(cmdPath, ['--', 'node', '-e', 'console.log(1)'], {
    stdio: ['ignore', 'ignore', 'ignore'],
    cwd: workingDir
  })
  const files = fs.readdirSync(workingDir)
  assert.strictEqual(files.length, 1, 'test dir contains one dir')
})

test('accepts different workingDir as cmd.js arg', async t => {
  const workingDir = fs.mkdtempSync('0x')
  await spawnAsync('./cmd.js', ['--working-dir', workingDir, '--', 'node', '-e', 'console.log(1)'], {
    stdio: ['ignore', 'ignore', 'ignore']
  })
  const files = fs.readdirSync(workingDir)
  assert.strictEqual(files.length, 1, 'test dir contains one dir')
})
