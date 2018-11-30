'use strict'

/**
 * Simple examples of typical cases
 * These are all adapted from real profiles generated from demo applications
 **/

const init1 = { name: 'NativeModule.compile internal/bootstrap/loaders.js:236:44', type: 'JS' }
const init2 = { name: 'bootstrapNodeJSCore internal/bootstrap/node.js:12:24', type: 'JS' }
const cpp1 = { name: '/usr/bin/node', type: 'SHARED_LIB' }
const cpp2 =  { name: 'C:\\Program Files\\nodejs\\node.exe', type: 'SHARED_LIB' }
const v81 = { name: 'v8::internal::Runtime_CompileLazy(int, v8::internal::Object**, v8::internal::Isolate*)', type: 'CPP' }
const v82 = { name: 'Call_ReceiverIsNotNullOrUndefined', type: 'CODE', kind: 'BuiltIn' }
const regexp1 = { name: '[\u0000zA-Z\u0000#$%&\'*+.|~]+$', type: 'CODE', kind: 'RegExp' }
const regexp2 = { name: '; *([!#$%&\'*+.^_`|~0-9A-Za-z-]+) *= *("(?:[ !#-[]-~-ÿ]|00b -ÿ])*"|[!#$%&\'*+.^_`|~0-9A-Za-z-]+) *', type: 'CODE', kind: 'RegExp' }
const native1 = { name: 'InnerArraySort native array.js:486:24', type: 'JS', kind: 'Unopt' }
const native2 = { name: '(anonymous) :486:24', type: 'JS', kind: 'Opt' }
const core1 = { name: 'validatePath internal/fs/utils.js:442:22', type: 'JS', kind: 'Opt' }
const core2 = { name: 'nullCheck internal/fs/utils.js:188:19', type: 'JS', kind: 'Unopt' }
const deps1 = { name: 'run /root/0x/examples/rest-api/node_modules/restify/lib/server.js:807:38', type: 'JS', kind: 'Opt' }
const deps2 = { name: 'next C:\\Users\\Name With Spaces\\Documents\\app\\node_modules\\express\\lib\\router\\index.js:176:16', type: 'JS', kind: 'Unopt' }
const app1 = { name: '(anonymous) /root/0x/examples/rest-api/etag.js:1:11', type: 'JS', kind: 'Unopt' }
const app2 = { name: 'app.get C:\\Documents And Settings\\node-clinic-flame-demo\\1-server-with-slow-function.js:8:14', type: 'JS', kind: 'Opt' }
const inlinable = { name: 'getMediaTypePriority /root/0x/examples/rest-api/node_modules/negotiator/lib/mediaType.js:99:30', type: 'JS', kind: 'Unopt' }

// Make it iterable with keys so tests can loop through and get expected results by key
module.exports = {
  init1,
  init2,
  cpp1,
  cpp2,
  v81,
  v82,
  regexp1,
  regexp2,
  native1,
  native2,
  core1,
  core2,
  deps1,
  deps2,
  app1,
  app2,
  inlinable
}
