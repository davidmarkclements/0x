const { test } = require('tap')
const cpuProfile = require('../lib/cpu-profile-to-tree')

const exampleProfile = {
  'typeId': 'CPU',
  'uid': '1',
  'title': 'p1',
  'head': {
    'functionName': '(root)',
    'url': '',
    'lineNumber': 0,
    'callUID': 243,
    'bailoutReason': '',
    'id': 1,
    'scriptId': 0,
    'hitCount': 0,
    'children': [
      {
        'functionName': 'first_function',
        'url': 'one.js',
        'lineNumber': 64,
        'callUID': 107,
        'bailoutReason': 'no reason',
        'id': 2,
        'scriptId': 1,
        'hitCount': 0,
        'children': [
          {
            'functionName': 'second_function',
            'url': 'two.js',
            'lineNumber': 64,
            'callUID': 107,
            'bailoutReason': 'no reason',
            'id': 2,
            'scriptId': 2,
            'hitCount': 3,
            'children': []
          }, {
            'functionName': 'second_function',
            'url': 'two.js',
            'lineNumber': 64,
            'callUID': 107,
            'bailoutReason': 'no reason',
            'id': 2,
            'scriptId': 3,
            'hitCount': 7,
            'children': []
          }
        ]
      }
    ]
  }
}

const _expected = {
  'children': [
    {
      'children': [
        {
          'children': [],
          'name': 'second_function two.js:64',
          'top': 3,
          'value': 3,
          'S': 0
        },
        {
          'children': [],
          'name': 'second_function two.js:64',
          'top': 7,
          'value': 7,
          'S': 0
        }
      ],
      'name': 'first_function one.js:64',
      'top': 0,
      'value': 10,
      'S': 0
    }
  ],
  'name': '(root)',
  'top': 0,
  'value': 10,
  'S': 0
}

const expected = {
  'merged': _expected,
  'unmerged': _expected
}

test('v8 profile converter works', function (t) {
  const result = cpuProfile(exampleProfile)
  t.same(result, expected)
  t.end()
})
