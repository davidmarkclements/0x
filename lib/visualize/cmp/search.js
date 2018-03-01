'use strict'

module.exports = (render) => (action) => {
  const search = render `
    <input type="search  " placeholder="search  " class='absolute' style="top: 0.5em; right: 5%;">
  `
  var lastKey = Date.now()
  search.addEventListener('keydown', function (e) {
    if (Date.now() - lastKey < 150) return
    lastKey = Date.now()
    action(e.target)
  })
  return search
}


