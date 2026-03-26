import { lstat, mkdir, readFile, writeFile } from 'fs/promises'
import { okAsync, ResultAsync } from 'neverthrow'

import { isErrnoException } from '../utils/error'
import { FileNotFound } from './error/fileNotFound'
import { IOError } from './error/ioError'
import { createLogger } from '../utils/logger'

const logger = createLogger('fileService')

export const safeReadFile = (filePath: string): ResultAsync<string, FileNotFound | IOError> =>
  ResultAsync.fromPromise(readFile(filePath, 'utf-8'), (e) => {
    if (isErrnoException(e) && e.code === 'ENOENT') {
      return FileNotFound.fromMessage(e.message)
    }
    return IOError.fromMessage(String(e))
  })
    .andTee(() => logger.debug('ファイルの読み込みに成功しました。', { 'file.path': filePath }))
    .orTee((e) =>
      logger.error('ファイルの読み込みに失敗しました。', {
        'file.path': filePath,
        'error.code': e.type,
        'error.message': e.message
      })
    )

export const safeWriteFile = (filePath: string, body: string): ResultAsync<void, IOError> =>
  ResultAsync.fromPromise(writeFile(filePath, body, 'utf-8'), (e) =>
    IOError.fromMessage(isErrnoException(e) ? e.message : String(e))
  )
    .andTee(() => logger.debug('ファイルの書き込みに成功しました。', { 'file.path': filePath }))
    .orTee((e) =>
      logger.error('ファイルの書き込みに失敗しました。', {
        'file.path': filePath,
        'error.code': e.type,
        'error.message': e.message
      })
    )

const _exist = async (path: string): Promise<boolean> => {
  try {
    return !!lstat(path)
  } catch (e) {
    if (isErrnoException(e) && e.code === 'ENOENT') {
      // NOTE: この関数の目的はファイルの存在チェックなので、ファイルが存在しない旨のエラーは正常系として返す
      return false
    }
    throw e
  }
}

export const safeExistFile = (path: string): ResultAsync<boolean, IOError> =>
  ResultAsync.fromPromise(_exist(path), (e) => {
    return IOError.fromMessage(String(e))
  })

type MkdirOptions = { recursive?: boolean }

export const safeMkdir = (
  path: string,
  options?: MkdirOptions
): ResultAsync<string | undefined, IOError> =>
  ResultAsync.fromPromise(mkdir(path, options), (e) => {
    return IOError.fromMessage(String(e))
  })

export const safeEnsureDir = (path: string): ResultAsync<void, IOError> => {
  return (
    okAsync(path)
      .andThen((path) => {
        if (!safeExistFile(path)) {
          return safeMkdir(path, { recursive: true })
            .andTee(() => logger.info('ディレクトリを作成しました。', { 'file.path': path }))
            .orTee((e) =>
              logger.error('ディレクトリの作成に失敗しました。', {
                'file.path': path,
                'error.code': e.type,
                'error.message': e.message
              })
            )
        }
        return okAsync(undefined)
      })
      // NOTE: fsの情報はこのファイル内でのみ取り扱い、今後ファイルの情報が必要となった場合はアプリケーション向けに型を定義する
      .map(() => undefined)
  )
}
