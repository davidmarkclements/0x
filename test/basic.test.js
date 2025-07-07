const { resolve } = require('path')
const { test } = require('tap')
const fs = require('fs')

test('module loads', function (t) {
  require('../')
  t.pass('0x loaded')
  t.end()
})

test('accepts different workingDir', async t => {
  const zeroEks = require('../')
  const opts = {
    argv: [resolve(__dirname, './fixture/do-eval.js')],
    workingDir: resolve('./')
  }
  const file = zeroEks(opts)
  t.resolves(file)
  t.end()
})

test('sets default workingDir when cmd.js is run', async t => {
  const workingDir = t.testdir()
  const cmdPath = resolve(__dirname, '../cmd.js')
  await t.spawn(cmdPath, ['--', 'node', '-e', 'console.log(1)'], {
    stdio: ['ignore', 'ignore', 'ignore'],
    cwd: workingDir
  })
  const files = fs.readdirSync(workingDir)
  t.ok(files.length === 1, 'test dir contains one dir')
})

test('accepts different workingDir as cmd.js arg', async t => {
  const workingDir = t.testdir()
  await t.spawn('./cmd.js', ['--working-dir', workingDir, '--', 'node', '-e', 'console.log(1)'], {
    stdio: ['ignore', 'ignore', 'ignore']
  })
  const files = fs.readdirSync(workingDir)
  t.ok(files.length === 1, 'test dir contains one dir')
})
