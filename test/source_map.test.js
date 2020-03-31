const { test } = require('tap')

 const htmlLink = await zeroX({
    argv: [ resolve(__dirname, './fixture/sourcemap.min.js') ],
    workingDir: resolve('./'),
    collectOnly: true,
  	treeDebug: true
  }).catch(onError)
