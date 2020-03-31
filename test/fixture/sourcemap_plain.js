'use strict'
var count = 0
var max = 10
var res = 0

function testTimeout () {
  setInterval(testInterval, 100)
}

function testInterval () {
  res += 1
  count++
  console.log(res)

  if (count >= max) {
    console.log('Process exited now. Hit ctrl+c')
    return process.exit()
  }
}

console.log(`Starting process(${process.pid}) with simple example.`)
setTimeout(testTimeout, 500)
