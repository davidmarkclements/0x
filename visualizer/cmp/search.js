'use strict'

const debounce = require('debounce')

module.exports = (render) => (action) => {
  const search = render`
    <input type="search" placeholder="search functions" class='absolute right-0 top-0 mt2 f5 mr1'>
  `
  search.addEventListener('keydown', debounce(({ target }) => action({type: 'key', value: target.value}), 150))

  return search
}
