'use strict'
const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow
const nativeImage = electron.nativeImage

const appIcon = nativeImage.createFromPath(`${__dirname}/0x_Logo.png`)
let mainWindow

// needed for OS X doc
if (process.platform === 'darwin') {
  app.dock.setIcon(appIcon)
}

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: appIcon
  })

  mainWindow.loadURL(process.argv[2])

  mainWindow.on('close', () => {

  })

  mainWindow.on('closed', function () {
    mainWindow.removeAllListeners('close')
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
  // this auto-closes the app when there is no window left
  app.quit()
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})
