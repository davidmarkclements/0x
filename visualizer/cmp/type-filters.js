'use strict'

const createHoc = (render) => ({bg, exclude, name, disabled = false}, action) => {
  const pressed = !disabled && !exclude.has(name)
  return render`
    <button 
      class="f7 pointer br2 ba mb0 dib black-70 lh-title border-box ml2 ${pressed ? 'b--black' : ''} ${disabled ? 'o-50 gray' : ''}" 
      ${disabled ? 'disabled' : ''}
      style="
        ${pressed ? 'box-shadow: 0 0 0 1px black;' : ''}
        background: ${bg};
      "
      onclick=${() => action({name})}
    >${name}</button>
  `
}

module.exports = (render) => ({bgs, exclude, enableInlinable, renderInlinable}, action) => {
  const hoc = createHoc(render)
  const inlinable = renderInlinable ? hoc({bg: bgs['inlinable'], exclude, name: 'inlinable', disabled: !enableInlinable}, action) : ''
  const app = hoc({bg: bgs.app, exclude, name: 'app'}, action)
  const deps = hoc({bg: bgs.deps, exclude, name: 'deps'}, action)
  const core = hoc({bg: bgs.core, exclude, name: 'core'}, action)
  const native = hoc({bg: bgs.native, exclude, name: 'native'}, action)
  const regexp = hoc({bg: bgs.regexp, exclude, name: 'regexp'}, action)
  const v8 = hoc({bg: bgs.v8, exclude, name: 'v8'}, action)
  const cpp = hoc({bg: bgs.cpp, exclude, name: 'cpp'}, action)
  return render`
    <div style='margin-left:-.5rem'>
      ${app}${deps}${core}${inlinable}${native}${regexp}${v8}${cpp}
    </div>
  `
}
