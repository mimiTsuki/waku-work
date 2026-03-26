import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import { app, BrowserWindow, shell } from 'electron'
import { join } from 'path'
import icon from '../../resources/icon.png?asset'
import { env } from './env'
import { createLogger } from '@core/utils/logger'

const logger = createLogger('app')

import {
  type AppConfig,
  type EnsureDataDirRepository,
  type GetConfigRepository,
  DEFAULT_CONFIG,
  FileEnsureConfigDirRepository,
  FileEnsureDataDirRepository,
  FileGetConfigRepository,
  FileSaveConfigRepository,
  GetConfigUsecase,
  SaveConfigUsecase,
  ConfigController
} from './config'
import {
  FileListLogsRepository,
  FileSaveLogsRepository,
  ListLogsUsecase,
  MoveLogEntryUsecase,
  SaveLogsUsecase,
  LogController
} from './log'
import {
  FileListProjectsRepository,
  FileSaveProjectsRepository,
  ListProjectsUsecase,
  SaveProjectsUsecase,
  ProjectController
} from './project'
import { DialogController } from './dialog'

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    ...(env.platform === 'linux' ? { icon } : {}),
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

  if (is.dev && env.rendererUrl) {
    mainWindow.loadURL(env.rendererUrl)
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

type InitConfigCacheDeps = {
  getConfigRepository: GetConfigRepository
  ensureDataDirRepository: EnsureDataDirRepository
}

// TODO: 将来的にはConfigRepository側に寄せたい
const initConfigCache = async ({
  getConfigRepository,
  ensureDataDirRepository
}: InitConfigCacheDeps) => {
  let configCache = await getConfigRepository().match(
    (c) => c,
    () => DEFAULT_CONFIG
  )
  const getConfigCache = (): AppConfig => configCache
  const updateConfigCache = (nextConfig: AppConfig) => {
    configCache = nextConfig
    ensureDataDirRepository(configCache.dataDir)
  }

  ensureDataDirRepository(configCache.dataDir)

  return {
    getConfigCache,
    updateConfigCache
  }
}

app.whenReady().then(async () => {
  logger.info('アプリケーションを起動しています。', { 'app.version': app.getVersion() })
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Repository

  const ensureConfigDirRepository = FileEnsureConfigDirRepository.of()
  const ensureDataDirRepository = FileEnsureDataDirRepository.of()
  const getConfigRepository = FileGetConfigRepository.of({
    ensureConfigDirRepository
  })

  // NOTE: 設定ファイルの読み取りはアプリ起動時と設定変更時のみとする
  const { getConfigCache, updateConfigCache } = await initConfigCache({
    getConfigRepository,
    ensureDataDirRepository
  })

  const saveConfigRepository = FileSaveConfigRepository.of({
    ensureConfigDirRepository
  })

  const readLogs = FileListLogsRepository.of(getConfigCache)
  const writeLogs = FileSaveLogsRepository.of(getConfigCache)
  const readProjects = FileListProjectsRepository.of(getConfigCache)
  const writeProjects = FileSaveProjectsRepository.of(getConfigCache)

  // Usecase

  const listLogsUsecase = ListLogsUsecase.of({ listLogsRepository: readLogs })
  const saveLogsUsecase = SaveLogsUsecase.of({ saveLogsRepository: writeLogs })
  const moveLogEntryUsecase = MoveLogEntryUsecase.of({
    listLogsRepository: readLogs,
    saveLogsRepository: writeLogs
  })
  const listProjectsUsecase = ListProjectsUsecase.of({ listProjects: readProjects })
  const saveProjectsUsecase = SaveProjectsUsecase.of({ writeProjects })
  const getConfigUsecase = GetConfigUsecase.of({ getConfigRepository })
  const saveConfigUsecase = SaveConfigUsecase.of({
    saveConfigRepository,
    onChange: updateConfigCache
  })

  // Controller

  LogController.of({ listLogsUsecase, saveLogsUsecase, moveLogEntryUsecase })
  ProjectController.of({ listProjectsUsecase, saveProjectsUsecase })
  ConfigController.of({ getConfigUsecase, saveConfigUsecase })
  DialogController.of()

  createWindow()
  logger.info('アプリケーションの起動が完了しました。')

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (env.platform !== 'darwin') {
    logger.info('アプリケーションを終了します。')
    app.quit()
  }
})
