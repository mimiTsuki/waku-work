import { z } from 'zod'
import { ok, ResultAsync, safeTry } from 'neverthrow'
import { BaseError } from '../utils/error'
import { LogEntry } from './domain'
import type {
  ListLogsRepository,
  SaveLogsRepository,
  SaveMultipleLogsRepository
} from './repository'

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
  saveMultipleLogsRepository: SaveMultipleLogsRepository
}

export const MoveLogEntryUsecase = {
  of:
    ({
      listLogsRepository,
      saveLogsRepository,
      saveMultipleLogsRepository
    }: MoveLogEntryUsecaseDeps): MoveLogEntryUsecase =>
    ({ entryId, fromYear, fromMonth, toYear, toMonth, entry }) => {
      const sameMonth = fromYear === toYear && fromMonth === toMonth

      if (sameMonth) {
        return safeTry<void, BaseError>(async function* () {
          const logs = yield* await listLogsRepository({ year: fromYear, month: fromMonth })
          const updated = [...logs.filter((e) => e.id !== entryId), entry]
          yield* await saveLogsRepository({ year: fromYear, month: fromMonth, logs: updated })
          return ok(undefined)
        })
      }

      // NOTE: 複数ファイルへの書き込みはCopy-on-Writeでアトミックに実施する
      return safeTry<void, BaseError>(async function* () {
        const [fromLogs, toLogs] = yield* await ResultAsync.combine([
          listLogsRepository({ year: fromYear, month: fromMonth }),
          listLogsRepository({ year: toYear, month: toMonth })
        ])

        const filtered = fromLogs.filter((e) => e.id !== entryId)

        yield* await saveMultipleLogsRepository([
          { year: fromYear, month: fromMonth, logs: filtered },
          { year: toYear, month: toMonth, logs: [...toLogs, entry] }
        ])

        return ok(undefined)
      })
    }
}
