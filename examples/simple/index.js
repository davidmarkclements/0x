'use strict'
let count = 0, max = 10, res = 0

console.log('Starting process with simple example.');
setTimeout(()=>{
  setInterval(()=>{
    res += 1
    count++
    console.log(res);

    if (count >= max) {
      console.log('Process exited now. Hit ctrl+c');
      return process.exit()
    }

  }, 10)
}, 500)
