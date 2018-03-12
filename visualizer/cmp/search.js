'use strict'

const debounce = require('debounce')

module.exports = (render) => (action) => {
  const search = render `
    <input type="search  " placeholder="search functions" class='absolute' style="top: 0.5em; right: 5%;">
  `
  search.addEventListener('keydown', debounce((e) => action(e.target), 150))
  return search
}


