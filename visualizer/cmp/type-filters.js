'use strict'

const createHoc = (render) => ({bg, exclude, name}, action) => {
  return render `
    <label class='dib pointer pr2 mb3 pb1' style='background: ${bg}'>
      <input class='mr1 ml1' type=checkbox checked=${!exclude.has(name)} id=${name} onchange=${({target}) => {
        action({checked: target.checked, name})
      }}>
      ${name}
    </label>
  `
}  

module.exports = (render) => ({bgs, exclude}, action) => {
  const hoc = createHoc(render)
  const app = hoc({bg: bgs.app, exclude, name: 'app'}, action)
  const deps = hoc({bg: bgs.deps, exclude, name: 'deps'}, action)
  const core = hoc({bg: bgs.core, exclude, name: 'core'}, action)
  const native = hoc({bg: bgs.native, exclude, name: 'native'}, action)
  const regexp = hoc({bg: bgs.regexp, exclude, name: 'regexp'}, action)
  const v8 = hoc({bg: bgs.v8, exclude, name: 'v8'}, action)
  const cpp = hoc({bg: bgs.cpp, exclude, name: 'cpp'}, action)
  return render `
    <div class='absolute bottom-1 right-2 h1 pr5 f5 black'>
      ${app}${deps}${core}${native}${regexp}${v8}${cpp}
    </div>
  `
}