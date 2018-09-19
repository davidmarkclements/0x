'use strict'

const typeFiltersCmp = require('./type-filters')
const keyCmp = require('./key')
const controlsCmp = require('./controls')
const zoomCmp = require('./zoom')
const searchCmp = require('./search')
const titleCmp = require('./title')
module.exports = (render) => ({ state, actions }) => {
  const typeFilters = typeFiltersCmp(render)
  const key = keyCmp(render)
  const controls = controlsCmp(render)
  const zoom = zoomCmp(render)
  const search = searchCmp(render)
  const title = titleCmp(render)

  return render`
    <div>
      <div class='fixed left-0 top-0 w-100 bg-white h2 pt1 pb2' style='box-sizing: content-box'>
        ${search(actions.search())}
        ${title(state.title)}
        ${zoom(actions.zoom())}
        ${key(state.key)}
      </div>
      <div class='absolute left-0 w-100 h8 tc pb2 nowrap' style='padding-top: 2px'>
        ${controls(state.control, actions.control())}
        ${typeFilters(state.typeFilters, actions.typeFilters())}
      </div>
    </div>
  `
}
