import { api as Api } from '..'
import { readConfig, writeConfig } from './config'
import { moveLogEntry, readLogs, writeLogs } from './logs'
import { readProjects, writeProjects } from './projects'
import { readTemplates, writeTemplates } from './templates'

export const api = {
  readConfig,
  writeConfig,
  readLogs,
  writeLogs,
  moveLogEntry,
  readProjects,
  writeProjects,
  readTemplates,
  writeTemplates,
  // TODO: ブラウザ経由でディレクトリを選べるようにする
  selectFolder: () => Promise.resolve(null)
} satisfies typeof Api

export const IS_ELECTRON = false
