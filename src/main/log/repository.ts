import type { ResultAsync } from 'neverthrow'
import type { LogEntry } from './domain'
import { IOError } from '../file/error/ioError'
import { ValidationError } from '../utils/zod'
import { InvalidJsonError } from '../utils/json/parse'
import { SerializeError } from '../utils/json/serialize'
import { FileNotFound } from '../file/error/fileNotFound'

export type ListLogsRepository = (input: {
  year: number
  month: number
}) => ResultAsync<LogEntry[], IOError | ValidationError | InvalidJsonError | FileNotFound>

export type SaveLogsRepository = (input: {
  year: number
  month: number
  logs: LogEntry[]
}) => ResultAsync<void, IOError | SerializeError>
