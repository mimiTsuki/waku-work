import { lstat, mkdir, readdir, readFile, rename, unlink, writeFile } from 'fs/promises'
import { errAsync, ok, ResultAsync, safeTry } from 'neverthrow'

import { isErrnoException } from '../utils/error'
import { createLogger } from '../utils/logger'
import { FileNotFound } from './error/fileNotFound'
import { IOError } from './error/ioError'

const logger = createLogger('fileService')

export const safeReadFile = (filePath: string): ResultAsync<string, FileNotFound | IOError> =>
  ResultAsync.fromPromise(readFile(filePath, 'utf-8'), (e) => {
    if (isErrnoException(e) && e.code === 'ENOENT') {
      return FileNotFound.fromMessage(e.message)
    }
    return IOError.fromMessage(String(e))
  }).andTee(() => logger.debug('ファイルの読み込みに成功しました。', { 'file.path': filePath }))

const safeRename = (from: string, to: string): ResultAsync<void, IOError> =>
  ResultAsync.fromPromise(rename(from, to), (e) =>
    IOError.fromMessage(isErrnoException(e) ? e.message : String(e))
  )

const safeUnlink = (filePath: string): ResultAsync<void, IOError> =>
  ResultAsync.fromPromise(unlink(filePath), (e) =>
    IOError.fromMessage(isErrnoException(e) ? e.message : String(e))
  )

const _writeFile = (filePath: string, body: string): ResultAsync<void, IOError> =>
  ResultAsync.fromPromise(writeFile(filePath, body, 'utf-8'), (e) =>
    IOError.fromMessage(isErrnoException(e) ? e.message : String(e))
  )

/**
 * 単一ファイルのアトミック書き込み: tmp に書き込み → rename で差し替え
 */
export const safeAtomicWriteFile = (filePath: string, body: string): ResultAsync<void, IOError> => {
  const tmpPath = filePath + '.tmp'
  return _writeFile(tmpPath, body)
    .andThen(() => safeRename(tmpPath, filePath))
    .andTee(() => logger.debug('ファイルの書き込みに成功しました。', { 'file.path': filePath }))
}

export type FileWrite = { filePath: string; body: string }

/**
 * 複数ファイルのアトミック書き込み (Copy-on-Write プロトコル)
 * 1. 全ファイルを .tmp に書き込み
 * 2. 元ファイルを .bak にリネーム
 * 3. .tmp を最終パスにリネーム
 * 4. .bak を削除
 */
export const safeAtomicWriteFiles = (writes: FileWrite[]): ResultAsync<void, IOError> =>
  safeTry<void, IOError>(async function* () {
    const tmpPaths = writes.map((w) => w.filePath + '.tmp')

    for (const w of writes) {
      const result = await _writeFile(w.filePath + '.tmp', w.body)
      if (result.isErr()) {
        await _unlinkAll(tmpPaths)
        return errAsync(result.error)
      }
    }

    const bakedPaths: string[] = []
    for (const w of writes) {
      const result = await safeRename(w.filePath, w.filePath + '.bak')
      if (result.isErr()) {
        if (isErrnoException(result.error) && result.error.code === 'ENOENT') {
          // NOTE: 元ファイルが存在しない場合は新規作成なのでスキップ
          continue
        }
        await _rollbackBakFiles(bakedPaths)
        await _unlinkAll(tmpPaths)
        return errAsync(result.error)
      }
      bakedPaths.push(w.filePath)
    }

    for (const w of writes) {
      yield* await safeRename(w.filePath + '.tmp', w.filePath)
    }

    await _unlinkAll(bakedPaths.map((p) => p + '.bak'))

    logger.debug('複数ファイルのアトミック書き込みに成功しました。', {
      files: writes.map((w) => w.filePath).join(', ')
    })

    return ok(undefined)
  })

/**
 * ベストエフォートで全ファイルを削除
 */
const _unlinkAll = (paths: string[]): Promise<void[]> =>
  Promise.all(
    paths.map((p) =>
      unlink(p).catch((e) => {
        logger.warn('一時ファイルの削除に失敗しました。', {
          'file.path': p,
          error: isErrnoException(e) ? e.message : String(e)
        })
      })
    )
  )

/**
 * ベストエフォートで .bak を元のパスに戻す
 */
const _rollbackBakFiles = (originalPaths: string[]): Promise<void[]> =>
  Promise.all(
    originalPaths.map((p) =>
      rename(p + '.bak', p).catch((e) => {
        logger.warn('.bak ファイルのロールバックに失敗しました。', {
          'file.path': p,
          error: isErrnoException(e) ? e.message : String(e)
        })
      })
    )
  )

/**
 * エラーなどで孤立した .tmp / .bak ファイルを処理
 */
export const recoverIncompleteWrites = (dataDir: string): ResultAsync<void, IOError> =>
  safeTry<void, IOError>(async function* () {
    const files = yield* await ResultAsync.fromPromise(readdir(dataDir), (e) =>
      IOError.fromMessage(isErrnoException(e) ? e.message : String(e))
    )

    for (const bakFile of files.filter((f) => f.endsWith('.bak'))) {
      const originalName = bakFile.slice(0, -4)
      const bakPath = `${dataDir}/${bakFile}`
      if (files.includes(originalName)) {
        // 本体がある → .bak は不要
        yield* await safeUnlink(bakPath)
      } else {
        // 本体がない → .bak をリストア
        yield* await safeRename(bakPath, `${dataDir}/${originalName}`)
        logger.warn('不完全な書き込みをリカバリしました。', { 'file.path': originalName })
      }
    }

    for (const tmpFile of files.filter((f) => f.endsWith('.tmp'))) {
      yield* await safeUnlink(`${dataDir}/${tmpFile}`)
    }

    return ok(undefined)
  })

export const safeEnsureDir = (path: string): ResultAsync<void, IOError> =>
  safeTry<void, IOError>(async function* () {
    const exists = await lstat(path).then(
      () => true,
      () => false
    )
    if (!exists) {
      yield* await ResultAsync.fromPromise(mkdir(path, { recursive: true }), (e) =>
        IOError.fromMessage(isErrnoException(e) ? e.message : String(e))
      )
      logger.info('ディレクトリを作成しました。', { 'file.path': path })
    }
    return ok(undefined)
  })
