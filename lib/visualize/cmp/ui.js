'use strict'

const typeFiltersCmp = require('./type-filters')
const keyCmp = require('./key')
const controlsCmp = require('./controls')
const zoomCmp = require('./zoom')
const searchCmp = require('./search')

module.exports = (render) => ({initialState, actions}) => {
  const typeFilters = typeFiltersCmp(render) 
  const key = keyCmp(render) 
  const controls = controlsCmp(render) 
  const zoom = zoomCmp(render) 
  const search = searchCmp(render) 

  return render `
    <div>
      ${search(actions.search())}
      ${zoom(actions.zoom())}
      ${controls(initialState.control, actions.control())}
      ${key(initialState.key)}
      ${typeFilters(initialState.typeFilters, actions.typeFilters())}
    </div>
  `
}


