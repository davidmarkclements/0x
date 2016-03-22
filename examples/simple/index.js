'use strict'
var count = 0
var max = 10
var res = 0

console.log(`Starting process(${process.pid}) with simple example.`)
setTimeout(() => {
  setInterval(() => {
    res += 1
    count++
    console.log(res)

    if (count >= max) {
      console.log('Process exited now. Hit ctrl+c')
      return process.exit()
    }
  }, 10)
}, 500)
