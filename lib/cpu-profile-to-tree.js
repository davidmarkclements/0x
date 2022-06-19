'use strict'

// Filter out all parenthesized nodes with no children i.e. (idle), (garbage
// collector) and (program)
function filterParenthesizedNoChild (profileNode, convertedNode) {
  let name = profileNode.functionName
  if (!name) {
    name = profileNode.callFrame.functionName
  }
  const childrenLength = profileNode.children ? profileNode.children.length : 0
  if (name[0] === '(' && childrenLength === 0) {
    convertedNode.top = 0
    convertedNode.value = 0
  }
}

function convert (node) {
  const converted = {
    children: new Array(node.children.length),
    name: `${node.functionName}${node.url ? ' ' + node.url : ''}${node.lineNumber > 0 ? `:${node.lineNumber}` : ''}`,
    top: node.hitCount,
    value: node.hitCount,
    S: 0
  }
  filterParenthesizedNoChild(node, converted)
  for (let i = 0; i < node.children.length; i++) {
    converted.children[i] = convert(node.children[i])
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
  filterParenthesizedNoChild(node, converted)
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
