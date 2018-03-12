'use strict'



const createHoc = (render) => ({bg, exclude, name, disabled = false}, action) => {
  return render `
    <button 
      class="f7 pointer br2 ba mb0 dib black-70 lh-title ${disabled ? 'o-50 gray' : ''}" 
      ${disabled ? 'disabled' : ''}
      style="margin-left: .35rem; background: ${bg};${!disabled && !exclude.has(name) ? 'box-shadow: inset 1px 1px 2px 0px rgba(0, 0, 0, 0.9)' : ''}" 
      onclick=${() => action({name})}
    >${name}</button>
  `
}  

module.exports = (render) => ({bgs, exclude, enablePreInlined}, action) => {
  const hoc = createHoc(render)
  const preInlined = hoc({bg: bgs['pre-inlined'], exclude, name: 'pre-inlined', disabled: !enablePreInlined}, action)
  const app = hoc({bg: bgs.app, exclude, name: 'app'}, action)
  const deps = hoc({bg: bgs.deps, exclude, name: 'deps'}, action)
  const core = hoc({bg: bgs.core, exclude, name: 'core'}, action)
  const native = hoc({bg: bgs.native, exclude, name: 'native'}, action)
  const regexp = hoc({bg: bgs.regexp, exclude, name: 'regexp'}, action)
  const v8 = hoc({bg: bgs.v8, exclude, name: 'v8'}, action)
  const cpp = hoc({bg: bgs.cpp, exclude, name: 'cpp'}, action)
  return render `
    <div style='margin-left:.2rem'>
      ${app}${deps}${core}${preInlined}${native}${regexp}${v8}${cpp}
    </div>
  `
}