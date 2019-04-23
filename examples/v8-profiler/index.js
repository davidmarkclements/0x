const v8Profiler = require('v8-profiler-next')
const Koa = require('koa')
const Router = require('koa-router')
const fs = require('fs')
const { promisify } = require('util')

const writeFile = promisify(fs.writeFile)

let app = new Koa()
let router = new Router()

router.get('/', (ctx, next) => {
  // ctx.router available
  ctx.body = 'ok'
})

router.get('/start-profiling', (ctx, next) => {
  v8Profiler.startProfiling('p1')
  ctx.body = 'started'
})

router.get('/stop-profiling', async (ctx, next) => {
  const result = v8Profiler.stopProfiling('p1')
  if (result) {
    await writeFile('./v8-profile.json', JSON.stringify(result))
    ctx.body = 'saved profile'
  } else {
    ctx.body = 'nothing to show'
  }
})

app
  .use(router.routes())
  .use(router.allowedMethods())

app.listen(3000)
