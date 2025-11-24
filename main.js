const { app, BrowserWindow } = require('electron')
const path = require("path")
const {ipcMain} = require('electron')

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1920,
    height: 1080,
    useContentSize: true,
    fullscreen: false,
    fullscreenable: true,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      enableRemoteModule: true,
      additionalArguments: ["--ignore-gpu-blacklist", path.join(app.getPath("appData"), app.getName())]
    }
  });

  win.on("enter-full-screen", (event) => {
    win.webContents.send("fullscreen-entered")    
  })
  win.on("leave-full-screen", (event) => {
    win.webContents.send("fullscreen-left")
  })

  ipcMain.on("is-fullscreen", (event) => {
    event.returnValue = win.isFullScreen();
  })

  win.loadFile('GameOffline.html')
}

ipcMain.on('enter-fullscreen', (event, arg) => {
  BrowserWindow.getFocusedWindow().setFullScreen(true)
})

ipcMain.on('leave-fullscreen', (event, arg) => {
  BrowserWindow.getFocusedWindow().setFullScreen(false)
})

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  app.quit()
})