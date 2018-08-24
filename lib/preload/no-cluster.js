const cluster = require('cluster')

cluster.on('fork', () => {
  throw new Error('0x does not support clustering.')
})
