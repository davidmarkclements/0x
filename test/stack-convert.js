var convert = require(__dirname + '../stack-convert')
var fs = require('fs')
var expected = require(__dirname + './fixtures/expected-stack.json')
var input = fs.createReadStream(__dirname + './fixtures/stacks.out')
var diff = require('deep-diff').diff
var inspect = require('util').inspect
var split = require('split2')

input.pipe(split()).pipe(convert(function (err, json) {
   // console.log(inspect(diff(json, expected), {depth: Infinity}))
   
   fs.writeFileSync(__dirname + './output.json', JSON.stringify(json))
   fs.writeFileSync(__dirname + './expected.json', JSON.stringify(expected))
}))
