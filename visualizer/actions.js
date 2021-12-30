'use strict'

module.exports = createActions

function createActions ({ flamegraph, state }, emit) {
  state.typeFilters.bgs = state.typeFilters.unhighlighted

  const unmergedTags = tagNodesWithIds(state.trees.unmerged)
  const mergedTags = tagNodesWithIds(state.trees.merged)

  return {
    focusNode,
    search,
    control,
    zoom,
    typeFilters,
    pushState,
    jumpToState
  }

  function focusNode () {
    const save = pushState()
    return (node) => {
      const { merged } = state.control
      const { nodesToIds } = merged ? mergedTags : unmergedTags

      state.focusedNodeId = nodesToIds.get(node)
      save()
    }
  }

  function search () {
    return ({ type, value }) => {
      if (type === 'key') {
        if (!value) return flamegraph.clear()
        flamegraph.search(value, 'cyan')
      }
    }
  }

  function highlightTypeFilters () {
    return Object.assign(
      {},
      state.typeFilters.highlighted,
      [...Array.from(state.typeFilters.exclude),
        (state.typeFilters.enableInlinable ? '' : 'inlinable')
      ].reduce((o, k) => {
        o[k] = state.typeFilters.unhighlighted[k]
        return o
      }, {}))
  }

  function control () {
    return ({ type }) => {
      switch (type) {
        case 'tiers':
          state.control.tiers = !state.control.tiers
          flamegraph.tiers(state.control.tiers)
          state.typeFilters.bgs = state.control.tiers
            ? highlightTypeFilters()
            : state.typeFilters.unhighlighted
          emit(state)
          return
        case 'view':
          state.control.merged = !state.control.merged
          state.typeFilters.enableInlinable = !state.control.merged
          state.key.enableOptUnopt = !state.control.merged
          state.typeFilters.bgs = state.control.tiers
            ? highlightTypeFilters()
            : state.typeFilters.unhighlighted
          emit(state)
          if (state.control.merged) flamegraph.renderTree(state.trees.merged)
          else flamegraph.renderTree(state.trees.unmerged)
          return
        case 'optimized':
          state.control.optimized = !state.control.optimized
          // Deactivate the unoptimized button--d3-fg will auto clear its colours
          state.control.unoptimized = false
          emit(state)
          if (!state.control.optimized) return flamegraph.clear('yellow')
          flamegraph.search(/^\\*/, 'yellow')
          return
        case 'not-optimized':
          state.control.unoptimized = !state.control.unoptimized
          // Deactivate the optimized button--d3-fg will auto clear its colours
          state.control.optimized = false
          emit(state)
          if (!state.control.unoptimized) return flamegraph.clear('lime')
          flamegraph.search(/^~/, 'lime')
      }
    }
  }

  function zoom () {
    let zoomLevel = 1
    return ({ type }) => {
      switch (type) {
        case 'in':
          zoomLevel += 0.3
          // Some ludicrous max just in case
          if (zoomLevel > 10) zoomLevel = 10
          flamegraph.setGraphZoom(zoomLevel)
          return
        case 'out':
          zoomLevel -= 0.3
          if (zoomLevel < 0.1) zoomLevel = 0.1
          flamegraph.setGraphZoom(zoomLevel)
      }
    }
  }

  function typeFilters () {
    const save = pushState()
    return ({ name }) => {
      const checked = state.typeFilters.exclude.has(name)
      if (checked) {
        flamegraph.typeShow(name)
        state.typeFilters.exclude.delete(name)
      } else {
        flamegraph.typeHide(name)
        state.typeFilters.exclude.add(name)
      }
      if (state.control.tiers) state.typeFilters.bgs = highlightTypeFilters()
      save()
      emit(state)
    }
  }

  function pushState () {
    return () => {
      const { merged } = state.control
      const excludeTypes = Array.from(state.typeFilters.exclude)
      const historyState = {
        merged,
        nodeId: state.focusedNodeId,
        excludeTypes
      }
      window.history.pushState(historyState, '', `#${stringifyHistoryState(historyState)}`)
    }
  }

  // Jump to a state based on a history entry.
  function jumpToState () {
    return ({ merged, nodeId, excludeTypes }) => {
      state.focusedNodeId = nodeId
      state.control.merged = merged
      state.typeFilters.enableInlinable = !merged
      state.key.enableOptUnopt = !merged

      // Diff type exclude state to reach the one described by the entry
      const oldExclude = state.typeFilters.exclude
      const newExclude = new Set(excludeTypes)
      oldExclude.forEach((name) => {
        if (!newExclude.has(name)) {
          flamegraph.typeShow(name)
        }
      })
      newExclude.forEach((name) => {
        if (!oldExclude.has(name)) {
          flamegraph.typeHide(name)
        }
      })
      state.typeFilters.exclude = newExclude
      state.typeFilters.bgs = state.control.tiers
        ? highlightTypeFilters()
        : state.typeFilters.unhighlighted

      flamegraph.renderTree(merged ? state.trees.merged : state.trees.unmerged)
      const { idsToNodes } = merged ? mergedTags : unmergedTags
      flamegraph.zoom(idsToNodes.get(nodeId))

      emit(state)
    }
  }
}

// This just uses incrementing IDs but it will only
// be used for a single dataset, and it's deterministic enough for that
function tagNodesWithIds (data) {
  let id = 0
  const idsToNodes = new Map()
  const nodesToIds = new Map()
  tagNodes(data)

  return {
    idsToNodes,
    nodesToIds
  }

  function tag (node) {
    idsToNodes.set(id, node)
    nodesToIds.set(node, id)
    id++
  }
  function tagNodes (node) {
    tag(node)
    if (node.children) node.children.forEach(tagNodes)
  }
}

function stringifyHistoryState (state) {
  // Just use JSON I guess
  return JSON.stringify(state)
}
