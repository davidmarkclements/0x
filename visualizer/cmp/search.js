'use strict'

const debounce = require('debounce')

module.exports = (render) => (action) => {
  const search = render`
    <input type="search" placeholder="search functions" class='fr f5 mr1'>
  `
  search.addEventListener('keydown', debounce(({ target }) => action({ type: 'key', value: target.value }), 150))

  return search
}
