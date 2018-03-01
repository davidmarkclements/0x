'use strict'

module.exports = (render) => (props) => render `
   <h1 class='sans-serif black-70 b lh-title mt0 measure f3 ml4'> 
    ${props.title} 
  </h1>
`