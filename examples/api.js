'use strict'
const zeroEks = require('../')
const { join } = require('path')
zeroEks({
  argv: [join(__dirname, 'rest-api'), '--my-flag', '"value for my flag"'],
  workingDir: __dirname,
  onPort: 'echo hello port $PORT'
})
