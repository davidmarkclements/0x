'use strict'

const path = require('path')
const browserify = require('browserify')
const concat = require('concat-stream')
const pump = require('pump')
const debug = require('debug')('0x:render')
const ticksToTree = require('./ticks-to-tree')
const html = require('../visualizer/html')

module.exports = render

async function render (opts) {
  const {
    name, title, kernelTracing, outputHtml, pid,
    workingDir, mapFrames, ticks, inlined, folder, pathToNodeBinary,
    sourceMaps, relativePath
  } = opts
  debug('converted stacks to intermediate format')
  const trees = await ticksToTree(ticks, { mapFrames, inlined, sourceMaps, relativePath, pathToNodeBinary })

  const script = `
    ${await createBundle()}
    visualizer(${JSON.stringify(trees)}, ${JSON.stringify({ title, kernelTracing })})
  `
  const htmlPath = determineHtmlPath({ name, outputHtml, workingDir, pid, outputDir: folder })

  await html({
    title,
    name,
    script,
    htmlPath,
    dir: folder,
    stdout: name === '-' || htmlPath === '-'
  })

  debug('done rendering')
  return htmlPath === '-' ? null : `file://${htmlPath}`
}

function determineHtmlPath ({ name, outputHtml, workingDir, pid, outputDir }) {
  if (name === '-') return '-'
  var htmlPath = (outputHtml || (
    `{outputDir}${path.sep}{name}.html`
  )).replace('{pid}', pid || 'UNKNOWN_PID')
    .replace('{timestamp}', Date.now())
    .replace('{outputDir}', outputDir)
    .replace('{cwd}', workingDir)
    .replace('{name}', name)

  if (path.isAbsolute(htmlPath) === false) {
    htmlPath = path.join(workingDir, htmlPath)
  }
  return htmlPath
}

function createBundle () {
  return new Promise((resolve, reject) => {
    pump(
      browserify({ standalone: 'visualizer' }).add(path.resolve(__dirname, '..', 'visualizer')).bundle(),
      concat(resolve),
      (err) => err && reject(err)
    )
  })
}
