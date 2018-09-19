'use strict'

module.exports = (render) => ({ title }) => render`
   <h1 id=title class='sans-serif black-70 bg-white b lh-title measure-narrow measure-l f4 ml2 mt0 dib'>
    <style>@media (max-width: 584px) {#title {display: none}}</style>
    ${title}
  </h1>
`
