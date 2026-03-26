import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Hono } from 'hono'
import type { AppConfig } from '@core/config/domain'
import {
  DEFAULT_CONFIG,
  FileEnsureConfigDirRepository,
  FileEnsureDataDirRepository,
  FileGetConfigRepository,
  FileSaveConfigRepository
} from '@core/config/infrastructure'
import { GetConfigUsecase, SaveConfigUsecase } from '@core/config/usecase'
import { FileListLogsRepository, FileSaveLogsRepository } from '@core/log/infrastructure'
import { ListLogsUsecase, MoveLogEntryUsecase, SaveLogsUsecase } from '@core/log/usecase'
import {
  FileListProjectsRepository,
  FileSaveProjectsRepository
} from '@core/project/infrastructure'
import { ListProjectsUsecase, SaveProjectsUsecase } from '@core/project/usecase'
import { createLogger } from '@core/utils/logger'
import { configRoutes } from './routes/config'
import { logsRoutes } from './routes/logs'
import { projectsRoutes } from './routes/projects'

const logger = createLogger('server')

// --- DI ---

const ensureConfigDirRepository = FileEnsureConfigDirRepository.of()
const ensureDataDirRepository = FileEnsureDataDirRepository.of()
const getConfigRepository = FileGetConfigRepository.of({ ensureConfigDirRepository })

const initConfigCache = async () => {
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
  return { getConfigCache, updateConfigCache }
}

const main = async () => {
  const { getConfigCache, updateConfigCache } = await initConfigCache()

  const saveConfigRepository = FileSaveConfigRepository.of({ ensureConfigDirRepository })

  const readLogs = FileListLogsRepository.of(getConfigCache)
  const writeLogs = FileSaveLogsRepository.of(getConfigCache)
  const readProjects = FileListProjectsRepository.of(getConfigCache)
  const writeProjects = FileSaveProjectsRepository.of(getConfigCache)

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

  // --- App ---

  const app = new Hono()

  app.route('/api', logsRoutes({ listLogsUsecase, saveLogsUsecase, moveLogEntryUsecase }))
  app.route('/api', projectsRoutes({ listProjectsUsecase, saveProjectsUsecase }))
  app.route('/api', configRoutes({ getConfigUsecase, saveConfigUsecase }))

  app.use('/*', serveStatic({ root: './dist/renderer' }))

  const port = 3000
  logger.info(`サーバーを起動します。`, { port })
  serve({ fetch: app.fetch, port })
}

main()
