const { test } = require('tap')
const cpuProfile = require('../lib/cpu-profile-to-tree')

const exampleProfile = {
  typeId: 'CPU',
  uid: '1',
  title: 'p1',
  head: {
    functionName: '(root)',
    url: '',
    lineNumber: 0,
    callUID: 243,
    bailoutReason: '',
    id: 1,
    scriptId: 0,
    hitCount: 0,
    children: [
      {
        functionName: 'first_function',
        url: 'one.js',
        lineNumber: 64,
        callUID: 107,
        bailoutReason: 'no reason',
        id: 2,
        scriptId: 1,
        hitCount: 0,
        children: [
          {
            functionName: 'second_function',
            url: 'two.js',
            lineNumber: 64,
            callUID: 107,
            bailoutReason: 'no reason',
            id: 2,
            scriptId: 2,
            hitCount: 3,
            children: []
          }, {
            functionName: 'second_function',
            url: 'two.js',
            lineNumber: 64,
            callUID: 107,
            bailoutReason: 'no reason',
            id: 2,
            scriptId: 3,
            hitCount: 7,
            children: []
          }
        ]
      },
      {
        functionName: '(idle)',
        url: '',
        lineNumber: 0,
        callUID: 249,
        bailoutReason: '',
        id: 39,
        scriptId: 0,
        hitCount: 3678,
        children: []
      }
    ]
  }
}

const _expected = {
  children: [
    {
      children: [
        {
          children: [],
          name: 'second_function two.js:64',
          top: 3,
          value: 3,
          S: 0
        },
        {
          children: [],
          name: 'second_function two.js:64',
          top: 7,
          value: 7,
          S: 0
        }
      ],
      name: 'first_function one.js:64',
      top: 0,
      value: 10,
      S: 0
    },
    {
      children: [],
      name: '(idle)',
      top: 0,
      value: 0,
      S: 0
    }
  ],
  name: '(root)',
  top: 0,
  value: 10,
  S: 0
}

const expected = {
  merged: _expected,
  unmerged: _expected
}

test('v8 profile converter works', function (t) {
  const result = cpuProfile(exampleProfile)
  t.same(result, expected)
  t.end()
})

const exampleCpuProfProfile = {
  nodes: [
    {
      id: 4,
      callFrame: {
        functionName: 'second_function',
        scriptId: 2,
        url: 'two.js',
        lineNumber: 64,
        columnNumber: 30
      },
      hitCount: 7,
      children: []
    },
    {
      id: 1,
      callFrame: {
        functionName: '(root)',
        scriptId: 0,
        url: '',
        lineNumber: -1,
        columnNumber: -1
      },
      hitCount: 0,
      children: [2, 5]
    },
    {
      id: 3,
      callFrame: {
        functionName: 'first_function',
        scriptId: 2,
        url: 'two.js',
        lineNumber: 32,
        columnNumber: 31
      },
      hitCount: 3
    },
    {
      id: 2,
      callFrame: {
        functionName: 'main',
        scriptId: 1,
        url: 'one.js',
        lineNumber: 63,
        columnNumber: 28
      },
      hitCount: 2,
      children: [3, 4]
    },
    {
      id: 5,
      callFrame: {
        functionName: '(garbage collector)',
        scriptId: 0,
        url: '',
        lineNumber: -1,
        columnNumber: -1
      },
      hitCount: 766
    }
  ]
}

const _expectedCpuProf = {
  children: [
    {
      children: [
        {
          children: [],
          name: 'first_function two.js:32',
          top: 3,
          value: 3,
          S: 0
        },
        {
          children: [],
          name: 'second_function two.js:64',
          top: 7,
          value: 7,
          S: 0
        }
      ],
      name: 'main one.js:63',
      top: 2,
      value: 12,
      S: 0
    },
    {
      children: [],
      name: '(garbage collector)',
      top: 0,
      value: 0,
      S: 0
    }
  ],
  name: '(root)',
  top: 0,
  value: 12,
  S: 0
}

const expectedCpuProf = {
  merged: _expectedCpuProf,
  unmerged: _expectedCpuProf
}

test('v8 --cpu-prof profile converter works', function (t) {
  const result = cpuProfile(exampleCpuProfProfile)
  t.same(result, expectedCpuProf)
  t.end()
})
