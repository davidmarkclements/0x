'use strict'

const createHoc = (render) => ({ bg, exclude, name, lbl, disabled = false }, action) => {
  const pressed = !disabled && !exclude.has(name)
  return render`
    <button 
      class="f7 pointer br2 ba mb0 dib black-70 lh-title border-box ml1 ${pressed ? 'b--black' : ''} ${disabled ? 'o-50 gray' : ''}" 
      ${disabled ? 'disabled' : ''}
      style="
        ${pressed ? 'box-shadow: 0 0 0 1px black;' : ''}
        background: ${bg};
      "
      onclick=${() => action({ name })}
    >${lbl || name}</button>
  `
}

module.exports = (render) => ({ bgs, exclude, enableInlinable, renderInlinable, visualizeCpuProfile }, action) => {
  const hoc = createHoc(render)
  const app = hoc({ bg: bgs.app, exclude, name: 'app' }, action)
  const deps = hoc({ bg: bgs.deps, exclude, name: 'deps' }, action)
  const core = hoc({ bg: bgs.core, exclude, name: 'core' }, action)
  const wasm = hoc({ bg: bgs.wasm, exclude, name: 'wasm' }, action)
  const v8 = hoc({ bg: bgs.v8, exclude, name: 'v8' }, action)
  const init = hoc({ bg: bgs.init, exclude, name: 'init' }, action)
  if (visualizeCpuProfile) {
    return render`
    <div style='margin-left:-.25rem'>
      ${app}${deps}${core}${v8}${init}
    </div>
  `
  }
  const inlinable = renderInlinable ? hoc({ bg: bgs.inlinable, exclude, name: 'inlinable', disabled: !enableInlinable }, action) : ''
  const native = hoc({ bg: bgs.native, exclude, name: 'native' }, action)
  const regexp = hoc({ bg: bgs.regexp, exclude, name: 'regexp', lbl: 'rx' }, action)
  const cpp = hoc({ bg: bgs.cpp, exclude, name: 'cpp' }, action)

  return render`
    <div style='margin-left:-.25rem'>
      ${app}${deps}${core}${wasm}${inlinable}${native}${regexp}${v8}${cpp}${init}
    </div>
  `
}
