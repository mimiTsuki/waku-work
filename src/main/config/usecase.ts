import type { ResultAsync } from 'neverthrow'
import type { AppConfig } from './domain'
import type { GetConfigRepository, SaveConfigRepository } from './repository'
import { IOError } from '../file/error/ioError'
import { ValidationError } from '../utils/zod'
import { InvalidJsonError } from '../utils/json/parse'
import { SerializeError } from '../utils/json/serialize'
import { FileNotFound } from '../file/error/fileNotFound'

export type GetConfigUsecase = () => ResultAsync<
  AppConfig,
  IOError | ValidationError | InvalidJsonError | FileNotFound
>

export type SaveConfigUsecase = (config: AppConfig) => ResultAsync<void, IOError | SerializeError>

type GetConfigUsecaseDeps = {
  getConfigRepository: GetConfigRepository
}

export const GetConfigUsecase = {
  of:
    ({ getConfigRepository }: GetConfigUsecaseDeps): GetConfigUsecase =>
    () =>
      getConfigRepository()
}

type SaveConfigUsecaseDeps = {
  saveConfigRepository: SaveConfigRepository
  onChange: (config: AppConfig) => void
}

export const SaveConfigUsecase = {
  of:
    ({ saveConfigRepository, onChange }: SaveConfigUsecaseDeps): SaveConfigUsecase =>
    (config: AppConfig) =>
      saveConfigRepository(config).map(() => {
        onChange(config)
      })
}
