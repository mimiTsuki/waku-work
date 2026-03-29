import { ResultAsync } from 'neverthrow'
import { Template } from './domain'
import type { ListTemplatesRepository, SaveTemplatesRepository } from './repository'
import { IOError } from '../file/error/ioError'
import { ValidationError } from '../utils/zod'
import { InvalidJsonError } from '../utils/json/parse'
import { FileNotFound } from '../file/error/fileNotFound'
import { SerializeError } from '../utils/json/serialize'

export type ListTemplatesUsecase = () => ResultAsync<
  Template[],
  IOError | ValidationError | InvalidJsonError | FileNotFound
>

export type SaveTemplatesUsecase = (
  templates: Template[]
) => ResultAsync<void, IOError | SerializeError>

type ListTemplatesUsecaseDeps = {
  listTemplates: ListTemplatesRepository
}

export const ListTemplatesUsecase = {
  of:
    ({ listTemplates }: ListTemplatesUsecaseDeps): ListTemplatesUsecase =>
    () => {
      return listTemplates()
    }
}

type SaveTemplatesUsecaseDeps = {
  writeTemplates: SaveTemplatesRepository
}

export const SaveTemplatesUsecase = {
  of:
    ({ writeTemplates }: SaveTemplatesUsecaseDeps): SaveTemplatesUsecase =>
    (templates: Template[]) => {
      return writeTemplates(templates)
    }
}
