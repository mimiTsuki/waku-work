import { errAsync, ok, okAsync, safeTry } from 'neverthrow'
import { join } from 'path'
import { z } from 'zod'
import type { AppConfig } from '../config/domain'
import { readJsonFile } from '../file/jsonFile'
import { FileNotFound } from '../file/error/fileNotFound'
import { createLogger } from '../utils/logger'

const logger = createLogger('LogRepository')
import type {
  ListLogsRepository,
  SaveLogsRepository,
  SaveMultipleLogsRepository
} from './repository'
import { LogEntry } from './domain'
import { jsonSerialize } from '../utils/json/serialize'
import { safeAtomicWriteFile, safeAtomicWriteFiles, type FileWrite } from '../file/file'

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
        .andThen((body) => safeAtomicWriteFile(filePath, body))
        .orTee((e) => {
          logger.error('作業ログファイルの書き込みに失敗しました。', {
            'file.path': filePath,
            'error.code': e.type,
            'error.message': e.message
          })
        })
    }
}

export const FileSaveMultipleLogsRepository = {
  of:
    (getConfig: () => AppConfig): SaveMultipleLogsRepository =>
    (inputs) =>
      safeTry(async function* () {
        const dataDir = getConfig().dataDir
        const fileWrites: FileWrite[] = []
        for (const { year, month, logs } of inputs) {
          const sorted = [...logs].sort((a, b) => {
            if (a.date !== b.date) return a.date.localeCompare(b.date)
            return a.startTime.localeCompare(b.startTime)
          })
          const body = yield* jsonSerialize(sorted)
          fileWrites.push({ filePath: _logFilePath(dataDir, year, month), body })
        }
        yield* await safeAtomicWriteFiles(fileWrites)
        return ok(undefined)
      }).orTee((e) => {
        logger.error('複数の作業ログファイルのアトミック書き込みに失敗しました。', {
          'error.code': e.type,
          'error.message': e.message
        })
      })
}

function _logFilePath(dataDir: string, year: number, month: number): string {
  const mm = String(month).padStart(2, '0')
  return join(dataDir, `${year}-${mm}.json`)
}
