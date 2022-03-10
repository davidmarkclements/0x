const assert = require('assert')

assert.ok(process.stdout.fd)
assert.equal(process.stdout.fd, 3)
