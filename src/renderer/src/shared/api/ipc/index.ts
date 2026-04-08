import { api as Api } from '..'
import { readConfig, writeConfig, selectFolder } from './config'
import { moveLogEntry, readLogs, writeLogs } from './logs'
import { readProjects, writeProjects } from './projects'
import { readTemplates, writeTemplates } from './templates'

export const api = {
  readConfig,
  writeConfig,
  selectFolder,
  readLogs,
  writeLogs,
  moveLogEntry,
  readProjects,
  writeProjects,
  readTemplates,
  writeTemplates
} satisfies typeof Api

export const IS_ELECTRON = true
