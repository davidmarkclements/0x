'use strict'

const phases = [
  (frames) => frames,
  (frames) => {
    var moduleRunMain = frames.find(({name}) => /Module.runMain module.js/.test(name))
    if (moduleRunMain) {
      const startupIndex = frames.findIndex(({name}) => /startup bootstrap_node/.test(name))
      if (startupIndex !== -1) frames.splice(startupIndex, 1)
      return frames
    }
    var startup = frames.find(({name}) => /startup bootstrap_node/.test(name))
    if (startup) return false
    return frames
  },
  (frames) => {
    if (frames.find(({name}) => /startup bootstrap_node/.test(name))) return false
    return frames
  }
]

module.exports = phases