#!/usr/bin/env node
'use strict'

const path = require('path')
const fs = require('fs')
var pathToNpm = path.resolve(fs.realpathSync(path.resolve(path.dirname(process.argv[0]), 'npm')), '../../')
var npm = require(pathToNpm)

npm.load({
  loaded: false
}, function (err) {
  if (err)
    console.log(err)

  let hasNoOpen = process.env['NO_OPEN_0X'] === 'true' ? true : false

  if (hasNoOpen === false) {
    npm.commands.install(['electron-prebuilt@^0.37.6'], function (err, data) {
      if (err)
        console.log(err)
    })
  }

  npm.on('log', function (message) {
    console.log(message)
  })
})
