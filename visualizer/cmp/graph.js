'use strict'

module.exports = (render) => (props) => {
  const graph = render `
    <chart class='db overflow-y-scroll overflow-x-hidden' style='padding-left: 5%; padding-right: 5%; height: 85%;'>
    </chart>
  `
  document.addEventListener('DOMContentLoaded', () => {
    graph.scrollTop = graph.scrollHeight
  })
  return graph
}