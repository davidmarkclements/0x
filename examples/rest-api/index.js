const etag = require('./etag')
const pkg = JSON.stringify(require('./package.json'))

const restify = require('restify')
const server = restify.createServer()
let count = 1

server.get('/a', function (req, res, next) {
  const tag = etag(pkg + ++count)

  if (!(tag instanceof Error)) {
    res.setHeader('ETag', tag)
  }

  res.send(pkg)
  return next()
})

server.get('/b', function (req, res, next) {
  const tag = etag({ entity: pkg + ++count, algorithm: 'sha256' })
  if (!(tag instanceof Error)) {
    res.setHeader('ETag', tag)
  }

  res.send(pkg)
  return next()
})

server.get('/c', function (req, res, next) {
  const tag = etag(pkg + ++count, { algorithm: 'sha512WithRsaEncryption' })

  if (!(tag instanceof Error)) {
    res.setHeader('ETag', tag)
  }

  res.send(pkg)
  return next()
})

server.listen(3000)
