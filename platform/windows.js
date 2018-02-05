'use strict'

const { unsupported } = require('../lib/util')

module.exports = windows 

function windows (args, sudo, binary) {
  unsupported(args, 'Windows')
}