'use strict'

module.exports = (render) => Object.assign(() => render`
  <chart
    class='db overflow-y-scroll overflow-x-hidden relative'
    style='padding-left: 5%; padding-right: 5%; height: calc(100vh - 66px)'
  >
  </chart>
`, { v8cats })

function v8cats (child) {
  var name = child.name

  if (/\[INIT]$/.test(name)) return { type: 'init' }

  if (/\[INLINABLE]$/.test(name)) return { type: 'inlinable' }

  if (!/\.m?js/.test(name)) {
    if (/\[CODE:RegExp]$/.test(name)) return { type: 'regexp' }
    if (/\[CODE:.*?]$/.test(name) || /v8::internal::.*\[CPP]$/.test(name)) return { type: 'v8' }
    if (/\.$/.test(name)) return { type: 'core' }
    if (/\[CPP]$/.test(name) || /\[SHARED_LIB]$/.test(name)) return { type: 'cpp' }
    if (/\[eval]/.test(name)) return { type: 'native' } // unless we create an eval checkbox
    // "native" is the next best label since
    // you cannot tell where the eval comes
    // from (app, deps, core)
    return { type: 'v8' }
  }

  if (/ native /.test(name)) return { type: 'native' }
  if (name.indexOf('/') === -1 || (/internal\//.test(name) && !/ \//.test(name))) return { type: 'core' }
  if (/node_modules/.test(name)) return { type: 'deps' }

  return { type: 'app' }
}
