'use strict'

const createHoc = (render) => ({bg, exclude, name}, action) => {
  return render `
    <label class='dib pointer pr2 pb3' style='background: ${bg}'>
      <input class='mr1 ml1' type=checkbox checked=${!~exclude.indexOf(name)} id=${name} onchange=${({target}) => {
        action({checked: target.checked, name})
      }}>
      ${name}
    </label>
  `
}  

module.exports = (render) => ({bg, exclude}, action) => {
  const hoc = createHoc(render)
  const app = hoc({bg, exclude, name: 'app'}, action)
  const deps = hoc({bg, exclude, name: 'deps'}, action)
  const core = hoc({bg, exclude, name: 'core'}, action)
  const nativeJS = hoc({bg, exclude, name: 'nativeJS'}, action)
  const nativeC = hoc({bg, exclude, name: 'nativeC'}, action)
  const regexp = hoc({bg, exclude, name: 'regexp'}, action)
  const v8 = hoc({bg, exclude, name: 'v8'}, action)
  return render `
    <div class='absolute bottom-1 right-2 h1 pr5 f5' style='color:${(bg === 'black' ? 'white' : 'black')}'>
      ${app}${deps}${core}${nativeJS}${nativeC}${regexp}${v8}
    </div>
  `
}