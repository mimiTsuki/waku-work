import { join } from 'path'
import { okAsync } from 'neverthrow'
import { z } from 'zod'
import type { AppConfig } from '../config/domain'
import { Project } from './domain'

import type { ListProjectsRepository, SaveProjectsRepository } from './repository'

import { readJsonFile } from '../file/jsonFile'
import { createLogger } from '../utils/logger'

const logger = createLogger('ProjectRepository')
import { jsonSerialize } from '../utils/json/serialize'
import { safeAtomicWriteFile } from '../file/file'

const PROJECTS_FILE = 'projects.json'

export const FileListProjectsRepository = {
  of:
    (getConfig: () => AppConfig): ListProjectsRepository =>
    () => {
      const filePath = join(getConfig().dataDir, PROJECTS_FILE)

      return readJsonFile(filePath, z.array(Project.schema)).orTee((e) => {
        logger.error('プロジェクトファイルの読み込みに失敗しました。', {
          'file.path': filePath,
          'error.code': e.type,
          'error.message': e.message
        })
      })
    }
}

export const FileSaveProjectsRepository = {
  of:
    (getConfig: () => AppConfig): SaveProjectsRepository =>
    (projects) => {
      const filePath = join(getConfig().dataDir, PROJECTS_FILE)

      return okAsync(projects)
        .andThen((p) => jsonSerialize(p))
        .andThen((body) => safeAtomicWriteFile(filePath, body))
        .orTee((e) => {
          logger.error('プロジェクトファイルの書き込みに失敗しました。', {
            'file.path': filePath,
            'error.code': e.type,
            'error.message': e.message
          })
        })
    }
}
