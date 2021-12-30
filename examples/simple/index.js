'use strict'
let count = 0
const max = 10
let res = 0

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
