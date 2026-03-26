import { z } from 'zod'
import { errAsync, ok, ResultAsync, safeTry } from 'neverthrow'
import { BaseError } from '../utils/error'
import { createLogger } from '../utils/logger'

const logger = createLogger('MoveLogEntryUsecase')
import { LogEntry } from './domain'
import type { ListLogsRepository, SaveLogsRepository } from './repository'

// Input schemas

const listLogsInputSchema = z.object({
  year: z.number().int(),
  month: z.number().int().min(1).max(12)
})

export const ListLogsInput = { schema: listLogsInputSchema }
export type ListLogsInput = z.infer<typeof listLogsInputSchema>

const saveLogsInputSchema = z.object({
  year: z.number().int(),
  month: z.number().int().min(1).max(12),
  logs: z.array(LogEntry.schema)
})

export const SaveLogsInput = { schema: saveLogsInputSchema }
export type SaveLogsInput = z.infer<typeof saveLogsInputSchema>

const moveLogEntryInputSchema = z.object({
  entryId: z.string(),
  fromYear: z.number().int(),
  fromMonth: z.number().int().min(1).max(12),
  toYear: z.number().int(),
  toMonth: z.number().int().min(1).max(12),
  entry: LogEntry.schema
})

export const MoveLogEntryInput = { schema: moveLogEntryInputSchema }
export type MoveLogEntryInput = z.infer<typeof moveLogEntryInputSchema>

// Usecases

export type ListLogsUsecase = (input: ListLogsInput) => ResultAsync<LogEntry[], BaseError>

export type SaveLogsUsecase = (input: SaveLogsInput) => ResultAsync<void, BaseError>

export type MoveLogEntryUsecase = (input: MoveLogEntryInput) => ResultAsync<void, BaseError>

type ListLogsUsecaseDeps = {
  listLogsRepository: ListLogsRepository
}

export const ListLogsUsecase = {
  of:
    ({ listLogsRepository }: ListLogsUsecaseDeps): ListLogsUsecase =>
    (input) =>
      listLogsRepository(input)
}

type SaveLogsUsecaseDeps = {
  saveLogsRepository: SaveLogsRepository
}

export const SaveLogsUsecase = {
  of:
    ({ saveLogsRepository }: SaveLogsUsecaseDeps): SaveLogsUsecase =>
    (input) =>
      saveLogsRepository(input)
}

type MoveLogEntryUsecaseDeps = {
  listLogsRepository: ListLogsRepository
  saveLogsRepository: SaveLogsRepository
}

// TODO: ロールバックの設計がイマイチなので将来的に修正する。
// 単一ファイル: 一時ファイルの作成とロックの仕組み
// 複数ファイル: WAL or コピーオンライト
// rollbackがダメだったエラーを定義する
export const MoveLogEntryUsecase = {
  of:
    ({ listLogsRepository, saveLogsRepository }: MoveLogEntryUsecaseDeps): MoveLogEntryUsecase =>
    ({ entryId, fromYear, fromMonth, toYear, toMonth, entry }) => {
      return safeTry<void, BaseError>(async function* () {
        // 更新前のログを取得(ロールバック実行時に必要)
        const [fromLogs, toLogs] = yield* await ResultAsync.combine([
          listLogsRepository({ year: fromYear, month: fromMonth }),
          listLogsRepository({ year: toYear, month: toMonth })
        ])

        // fromからはレコードを削除し、toへ追加する
        const saveResult = safeTry(async function* () {
          const filtered = fromLogs.filter((e) => e.id !== entryId)
          yield* await saveLogsRepository({
            year: fromYear,
            month: fromMonth,
            logs: filtered
          })
          yield* await saveLogsRepository({
            year: toYear,
            month: toMonth,
            logs: [...toLogs, entry]
          })
          return ok(undefined)
        })

        const moveContext = {
          'entry.id': entryId,
          from: `${fromYear}-${String(fromMonth).padStart(2, '0')}`,
          to: `${toYear}-${String(toMonth).padStart(2, '0')}`
        }

        // rollback: 書き込みに失敗した場合は両ファイルの内容をもとに戻す
        return saveResult.orElse((e) =>
          safeTry(async function* () {
            yield* await saveLogsRepository({ year: fromYear, month: fromMonth, logs: fromLogs })
            yield* await saveLogsRepository({
              year: toYear,
              month: toMonth,
              logs: toLogs
            })
            return errAsync(e)
          })
            // TODO: エラーメッセージを明確にする。ロールバックが成功したか失敗したか。エラーレベルも見直し
            .andTee(() =>
              logger.error('作業ログの月間移動に失敗しました。ロールバックは成功しました。', {
                ...moveContext,
                'error.code': e.type,
                'error.message': e.message
              })
            )
            .orTee((rollbackErr) =>
              logger.error(
                '作業ログの月間移動に失敗し、ロールバックにも失敗しました。データの整合性が損なわれている可能性があります。',
                {
                  ...moveContext,
                  'error.code': rollbackErr.type,
                  'error.message': rollbackErr.message,
                  'original_error.code': e.type,
                  'original_error.message': e.message
                }
              )
            )
        )
      })
    }
}
