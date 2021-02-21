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

ipcMain.on('findCredentials', async (event) => {
  say.log('findCredentials')
  const credentials = await keytar.findCredentials('endpoint')
  event.returnValue = credentials
})

ipcMain.on('setPassword', async (event, account, password) => {
  say.log('setPassword', account)
  keytar.setPassword('endpoint', account, password)
  event.returnValue = true
})

ipcMain.on('getPassword', async (event, account) => {
  say.log('getPassword', account)
  const pass = await keytar.getPassword('endpoint', account)
  event.returnValue = pass
})

ipcMain.on('deletePassword', async (event, account) => {
  say.log('deletePassword', account)
  const result = await keytar.deletePassword('endpoint', account)
  event.returnValue = result
})
