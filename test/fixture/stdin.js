#!/usr/bin/env node

// Just echo the stdin content
const run = async () => {
  const results = []
  for await (const chunk of process.stdin) {
    results.push(chunk)
  }
  return results.join('')
}

run().then((s) => process.stdout.write(s))
