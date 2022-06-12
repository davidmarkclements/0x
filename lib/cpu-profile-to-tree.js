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

function id2IndexMap (nodes) {
  const map = new Array(nodes.length + 1)
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    map[node.id] = i
  }
  return map
}

function convertCpuProf (nodes, id2Index, id) {
  const node = nodes[id2Index[id]]
  const name = node.callFrame.functionName
  const url = node.callFrame.url
  const lineNumber = node.callFrame.lineNumber
  const childrenLength = node.children ? node.children.length : 0
  const converted = {
    children: new Array(childrenLength),
    name: `${name}${url ? ' ' + url : ''}${lineNumber > 0 ? `:${lineNumber}` : ''}`,
    top: node.hitCount,
    value: node.hitCount,
    S: 0
  }
  if (name[0] === '(' && childrenLength === 0) {
    // filter out (garbage collector) and (idle)
    converted.top = 0
    converted.value = 0
  }
  for (let i = 0; i < childrenLength; i++) {
    converted.children[i] = convertCpuProf(nodes, id2Index, node.children[i])
    converted.value += converted.children[i].value
  }
  return converted
}

function cpuProfileToTree (profile) {
  const converted = profile.head
    ? convert(profile.head)
    : convertCpuProf(profile.nodes, id2IndexMap(profile.nodes), 1)
  return {
    merged: converted,
    unmerged: converted
  }
}

module.exports = cpuProfileToTree
