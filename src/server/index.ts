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
import {
  FileListLogsRepository,
  FileSaveLogsRepository,
  FileSaveMultipleLogsRepository
} from '@core/log/infrastructure'
import { ListLogsUsecase, MoveLogEntryUsecase, SaveLogsUsecase } from '@core/log/usecase'
import {
  FileListProjectsRepository,
  FileSaveProjectsRepository
} from '@core/project/infrastructure'
import { ListProjectsUsecase, SaveProjectsUsecase } from '@core/project/usecase'
import {
  FileListTemplatesRepository,
  FileSaveTemplatesRepository
} from '@core/template/infrastructure'
import { ListTemplatesUsecase, SaveTemplatesUsecase } from '@core/template/usecase'
import { recoverIncompleteWrites } from '@core/file/file'
import { createLogger } from '@core/utils/logger'
import { configRoutes } from './routes/config'
import { logsRoutes } from './routes/logs'
import { projectsRoutes } from './routes/projects'
import { templatesRoutes } from './routes/templates'

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

  await recoverIncompleteWrites(getConfigCache().dataDir).orTee((e) =>
    logger.warn('起動時リカバリに失敗しました。', { 'error.message': e.message })
  )

  const readLogs = FileListLogsRepository.of(getConfigCache)
  const writeLogs = FileSaveLogsRepository.of(getConfigCache)
  const readProjects = FileListProjectsRepository.of(getConfigCache)
  const writeProjects = FileSaveProjectsRepository.of(getConfigCache)
  const readTemplates = FileListTemplatesRepository.of(getConfigCache)
  const writeTemplates = FileSaveTemplatesRepository.of(getConfigCache)

  const listLogsUsecase = ListLogsUsecase.of({ listLogsRepository: readLogs })
  const saveLogsUsecase = SaveLogsUsecase.of({ saveLogsRepository: writeLogs })
  const writeMultipleLogs = FileSaveMultipleLogsRepository.of(getConfigCache)
  const moveLogEntryUsecase = MoveLogEntryUsecase.of({
    listLogsRepository: readLogs,
    saveLogsRepository: writeLogs,
    saveMultipleLogsRepository: writeMultipleLogs
  })
  const listProjectsUsecase = ListProjectsUsecase.of({ listProjects: readProjects })
  const saveProjectsUsecase = SaveProjectsUsecase.of({ writeProjects })
  const listTemplatesUsecase = ListTemplatesUsecase.of({ listTemplates: readTemplates })
  const saveTemplatesUsecase = SaveTemplatesUsecase.of({ writeTemplates })
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
  app.route('/api', templatesRoutes({ listTemplatesUsecase, saveTemplatesUsecase }))

  app.use('/*', serveStatic({ root: './dist/renderer' }))

  const port = 3000
  logger.info(`サーバーを起動します。`, { port })
  serve({ fetch: app.fetch, port })
}

main()
