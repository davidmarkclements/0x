'use strict'

const path = require('path')
const browserify = require('browserify')
const multistream = require('multistream')
const concat = require('concat-stream')
const pump = require('pump')
const pumpify = require('pumpify')
const debug = require('debug')('0x:render')
const ticksToTree = require('./ticks-to-tree')
const html = require('../visualizer/html')

module.exports = render 

async function render (args, {ticks, inlined, pid, folder}) {
  const { name, title, kernelTracing } = args
  debug('converted stacks to intermediate format')
  const trees = ticksToTree(ticks, args.mapFrames, inlined)

  const script = `
    ${await createBundle()}
    visualizer(${JSON.stringify(trees)}, ${JSON.stringify({title, kernelTracing})})
  `

  const htmlPath = determineHtmlPath(args, {pid, folder})
  const opts = {
    title,
    name,
    script,
    htmlPath,
    dir: folder,
    stdout: name === '-' || htmlPath === '-'
  }

  await html(opts)
  debug('done rendering')
  return htmlPath === '-' ? null : `file://${htmlPath}`
}

function determineHtmlPath (args, {pid, folder}) {
  if (args.name === '-') return '-'
  var htmlPath = (args.outputHtml || ( 
      `{outputDir}${path.sep}{name}.html`
  )).replace('{pid}', pid || 'UNKNOWN_PID')
  .replace('{timestamp}', Date.now())
  .replace('{outputDir}', folder)
  .replace('{cwd}', args.workingDir)
  .replace('{name}', args.name)

  if (path.isAbsolute(htmlPath) === false) {
    htmlPath = path.join(args.workingDir, htmlPath)
  }
  return htmlPath
}

function createBundle () {
  return new Promise((resolve, reject) => {
    pump(
      multistream([
        browserify({standalone: 'hsl'}).add(require.resolve('hsl-to-rgb-for-reals')).bundle(),
        browserify({standalone: 'fg'}).add(require.resolve('d3-fg')).bundle(),
        browserify({standalone: 'visualizer'}).add(path.resolve(__dirname, '..', 'visualizer')).bundle()
      ]),
      concat(resolve),
      (err) => err && reject(err)
    )
  })
}