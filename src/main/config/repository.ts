import type { ResultAsync } from 'neverthrow'
import type { AppConfig } from './domain'
import { IOError } from '../file/error/ioError'
import { SerializeError } from '../utils/json/serialize'
import { ValidationError } from '../utils/zod'
import { InvalidJsonError } from '../utils/json/parse'
import { FileNotFound } from '../file/error/fileNotFound'

export type GetConfigRepository = () => ResultAsync<
  AppConfig,
  IOError | ValidationError | InvalidJsonError | FileNotFound
>
export type SaveConfigRepository = (
  config: AppConfig
) => ResultAsync<void, IOError | SerializeError>

export type EnsureConfigRepository = () => ResultAsync<void, IOError>

export type EnsureDataDirRepository = (dataDir: string) => ResultAsync<void, IOError>
