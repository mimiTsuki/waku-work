import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { readConfig, writeConfig, ensureDataDir } from './services/configService'
import { readLogs, writeLogs, readProjects, writeProjects } from './services/fileService'
import type { AppConfig, LogEntry, Project } from '../shared/types'

let currentDataDir = ''

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Initialize data directory from config
  const config = readConfig()
  currentDataDir = config.dataDir
  ensureDataDir(currentDataDir)

  // IPC: config
  ipcMain.handle('config:read', () => {
    return readConfig()
  })

  ipcMain.handle('config:write', (_, data: AppConfig) => {
    writeConfig(data)
    currentDataDir = data.dataDir
    ensureDataDir(currentDataDir)
    return { success: true }
  })

  // IPC: logs
  ipcMain.handle('logs:read', (_, args: { year: number; month: number }) => {
    return readLogs(currentDataDir, args.year, args.month)
  })

  ipcMain.handle('logs:write', (_, args: { year: number; month: number; logs: LogEntry[] }) => {
    writeLogs(currentDataDir, args.year, args.month, args.logs)
    return { success: true }
  })

  // IPC: projects
  ipcMain.handle('projects:read', () => {
    return readProjects(currentDataDir)
  })

  ipcMain.handle('projects:write', (_, data: Project[]) => {
    writeProjects(currentDataDir, data)
    return { success: true }
  })

  // IPC: dialog
  ipcMain.handle('dialog:select-folder', async () => {
    const result = await dialog.showOpenDialog({ properties: ['openDirectory'] })
    if (result.canceled || result.filePaths.length === 0) return null
    return result.filePaths[0]
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
