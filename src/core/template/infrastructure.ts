import { join } from 'path'
import { errAsync, okAsync } from 'neverthrow'
import { z } from 'zod'
import type { AppConfig } from '../config/domain'
import { Template } from './domain'
import { FileNotFound } from '../file/error/fileNotFound'

import type { ListTemplatesRepository, SaveTemplatesRepository } from './repository'

import { readJsonFile } from '../file/jsonFile'
import { createLogger } from '../utils/logger'

const logger = createLogger('TemplateRepository')
import { jsonSerialize } from '../utils/json/serialize'
import { safeWriteFile } from '../file/file'

const TEMPLATES_FILE = 'templates.json'

export const FileListTemplatesRepository = {
  of:
    (getConfig: () => AppConfig): ListTemplatesRepository =>
    () => {
      const filePath = join(getConfig().dataDir, TEMPLATES_FILE)

      return readJsonFile(filePath, z.array(Template.schema))
        .orElse((e) => {
          if (e.type === FileNotFound.type) return okAsync([])
          return errAsync(e)
        })
        .orTee((e) => {
          logger.error('テンプレートファイルの読み込みに失敗しました。', {
            'file.path': filePath,
            'error.code': e.type,
            'error.message': e.message
          })
        })
    }
}

export const FileSaveTemplatesRepository = {
  of:
    (getConfig: () => AppConfig): SaveTemplatesRepository =>
    (templates) => {
      const filePath = join(getConfig().dataDir, TEMPLATES_FILE)

      return okAsync(templates)
        .andThen((t) => jsonSerialize(t))
        .andThen((body) => safeWriteFile(filePath, body))
        .orTee((e) => {
          logger.error('テンプレートファイルの書き込みに失敗しました。', {
            'file.path': filePath,
            'error.code': e.type,
            'error.message': e.message
          })
        })
    }
}
