import { errAsync, okAsync } from 'neverthrow'
import { join } from 'path'
import { z } from 'zod'
import type { AppConfig } from '../config/domain'
import { readJsonFile } from '../file/jsonFile'
import { FileNotFound } from '../file/error/fileNotFound'
import { createLogger } from '../utils/logger'

const logger = createLogger('LogRepository')
import type { ListLogsRepository, SaveLogsRepository } from './repository'
import { LogEntry } from './domain'
import { jsonSerialize } from '../utils/json/serialize'
import { safeWriteFile } from '../file/file'

export const FileListLogsRepository = {
  of:
    (getConfig: () => AppConfig): ListLogsRepository =>
    ({ year, month }) => {
      const filePath = _logFilePath(getConfig().dataDir, year, month)
      return readJsonFile(filePath, z.array(LogEntry.schema))
        .orElse((e) => {
          if (e.type === FileNotFound.type) return okAsync([])
          return errAsync(e)
        })
        .orTee((e) => {
          logger.error('作業ログファイルの読み込みに失敗しました。', {
            'file.path': filePath,
            'error.code': e.type,
            'error.message': e.message
          })
        })
    }
}

export const FileSaveLogsRepository = {
  of:
    (getConfig: () => AppConfig): SaveLogsRepository =>
    ({ year, month, logs }) => {
      const sorted = [...logs].sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date)
        return a.startTime.localeCompare(b.startTime)
      })
      const filePath = _logFilePath(getConfig().dataDir, year, month)
      return okAsync(sorted)
        .andThen((s) => jsonSerialize(s))
        .andThen((body) => safeWriteFile(filePath, body))
        .orTee((e) => {
          logger.error('作業ログファイルの書き込みに失敗しました。', {
            'file.path': filePath,
            'error.code': e.type,
            'error.message': e.message
          })
        })
    }
}

function _logFilePath(dataDir: string, year: number, month: number): string {
  const mm = String(month).padStart(2, '0')
  return join(dataDir, `${year}-${mm}.json`)
}
