'use strict'

function convert (profile) {
  const converted = {
    children: new Array(profile.children.length),
    name: `${profile.functionName}${profile.url ? ' ' + profile.url : ''}${profile.lineNumber > 0 ? `:${profile.lineNumber}` : ''}`,
    top: profile.hitCount,
    value: profile.hitCount,
    S: 0
  }
  if (profile.functionName[0] === '(' && profile.children.length === 0) {
    // filter out (garbage collector) and (idle)
    converted.top = 0
    converted.value = 0
  }
  for (let i = 0; i < profile.children.length; i++) {
    converted.children[i] = convert(profile.children[i])
    converted.value += converted.children[i].value
  }

  return converted
}

function cpuProfileToTree (profile) {
  const converted = convert(profile.head)
  return {
    merged: converted,
    unmerged: converted
  }
}

module.exports = cpuProfileToTree
