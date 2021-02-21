import { app, BrowserWindow, nativeTheme, ipcMain } from 'electron'
import say from './say'

try {
  if (process.platform === 'win32' && nativeTheme.shouldUseDarkColors === true) {
    require('fs').unlinkSync(require('path').join(app.getPath('userData'), 'DevTools Extensions'))
  }
} catch (_) { }

/**
 * Set `__statics` path to static files in production;
 * The reason we are setting it here is that the path needs to be evaluated at runtime
 */
if (process.env.PROD) {
  global.__statics = __dirname
}

let mainWindow

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    useContentSize: true,
    webPreferences: {
      // Change from /quasar.conf.js > electron > nodeIntegration;
      // More info: https://quasar.dev/quasar-cli/developing-electron-apps/node-integration
      nodeIntegration: process.env.QUASAR_NODE_INTEGRATION,
      nodeIntegrationInWorker: process.env.QUASAR_NODE_INTEGRATION,

      // More info: /quasar-cli/developing-electron-apps/electron-preload-script
      // preload: path.resolve(__dirname, 'electron-preload.js')
    }
  })

  mainWindow.loadURL(process.env.APP_URL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

ipcMain.on('debug', (event, arg) => {
  if (arg === 'on') {
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.webContents.closeDevTools()
  }
})

const keytar = require('keytar')

ipcMain.on('getCredentials', async (event, service) => {
  say.log('getCredentials')
  const credentials = await keytar.findCredentials(service)
  event.returnValue = credentials
})

ipcMain.on('setKey', async (event, service, key) => {
  say.log('setKey', service, key)
  await keytar.setPassword(service, 'key', key)
  event.returnValue = true
})

ipcMain.on('setSecret', async (event, service, secret) => {
  say.log('setSecret', service, secret)
  await keytar.setPassword(service, 'secret', secret)
  event.returnValue = true
})

ipcMain.on('setCredentials', async (event, service, key, secret) => {
  say.log('setCredentials', service, key, secret)
  await keytar.setPassword(service, 'key', key)
  await keytar.setPassword(service, 'secret', secret)
  event.returnValue = true
})

ipcMain.on('deleteCredentials', async (event, service) => {
  say.log('deleteCredentials', account)
  await keytar.deletePassword(service, 'key')
  await keytar.deletePassword(service, 'secret')
  event.returnValue = true
})
