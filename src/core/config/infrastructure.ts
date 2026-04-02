import { existsSync } from 'fs'
import { okAsync } from 'neverthrow'
import { homedir } from 'os'
import { join } from 'path'
import { safeEnsureDir, safeAtomicWriteFile } from '../file/file'
import { readJsonFile } from '../file/jsonFile'
import { jsonSerialize } from '../utils/json/serialize'
import { createLogger } from '../utils/logger'

const logger = createLogger('ConfigRepository')
import { AppConfig } from './domain'
import type {
  EnsureConfigRepository,
  EnsureDataDirRepository,
  GetConfigRepository,
  SaveConfigRepository
} from './repository'

const CONFIG_DIR = join(homedir(), '.config', 'waku-work')
const CONFIG_FILE = join(CONFIG_DIR, 'settings.json')

const DEFAULT_DATA_DIR = join(homedir(), '.config', 'waku-work', 'data')
export const DEFAULT_CONFIG: AppConfig = {
  dataDir: DEFAULT_DATA_DIR,
  theme: 'system',
  weekStartOnMonday: true
}

const _ensureConfigFile = () => {
  // 既に設定ファイルが存在する場合は何もしない
  if (existsSync(CONFIG_FILE)) {
    return okAsync(undefined)
  }
  return safeAtomicWriteFile(CONFIG_FILE, JSON.stringify(DEFAULT_CONFIG))
    .andTee(() =>
      logger.info('デフォルト設定ファイルを作成しました。', { 'file.path': CONFIG_FILE })
    )
    .orTee((e) =>
      logger.error('デフォルト設定ファイルの作成に失敗しました。', {
        'file.path': CONFIG_FILE,
        'error.code': e.type,
        'error.message': e.message
      })
    )
}

export const FileEnsureConfigDirRepository = {
  of: (): EnsureConfigRepository => () =>
    safeEnsureDir(CONFIG_DIR)
      .andThen(() => _ensureConfigFile())
      .orTee((e) => {
        logger.error('設定ディレクトリの初期化に失敗しました。', {
          'file.path': CONFIG_DIR,
          'error.code': e.type,
          'error.message': e.message
        })
      })
}

export const FileEnsureDataDirRepository = {
  of: (): EnsureDataDirRepository => (dataDir) =>
    safeEnsureDir(dataDir).orTee((e) => {
      logger.error('データディレクトリの初期化に失敗しました。', {
        'file.path': dataDir,
        'error.code': e.type,
        'error.message': e.message
      })
    })
}

type FileGetConfigRepositoryDeps = {
  ensureConfigDirRepository: EnsureConfigRepository
}

export const FileGetConfigRepository = {
  of:
    ({ ensureConfigDirRepository }: FileGetConfigRepositoryDeps): GetConfigRepository =>
    () => {
      ensureConfigDirRepository()
      return readJsonFile(CONFIG_FILE, AppConfig.schema)
    }
}

type FileSaveConfigRepositoryDeps = {
  ensureConfigDirRepository: EnsureConfigRepository
}

export const FileSaveConfigRepository = {
  of:
    ({ ensureConfigDirRepository }: FileSaveConfigRepositoryDeps): SaveConfigRepository =>
    (config: AppConfig) => {
      ensureConfigDirRepository()
      return okAsync(config)
        .andThen((c) => jsonSerialize(c))
        .andThen((json) => safeAtomicWriteFile(CONFIG_FILE, json))
        .orTee((e) => {
          logger.error('設定ファイルの保存に失敗しました。', {
            'file.path': CONFIG_FILE,
            'error.code': e.type,
            'error.message': e.message
          })
        })
    }
}
