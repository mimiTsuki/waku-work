import type { ResultAsync } from 'neverthrow'
import type { Template } from './domain'
import { IOError } from '../file/error/ioError'
import { ValidationError } from '../utils/zod'
import { InvalidJsonError } from '../utils/json/parse'
import { FileNotFound } from '../file/error/fileNotFound'
import { SerializeError } from '../utils/json/serialize'

export type ListTemplatesRepository = () => ResultAsync<
  Template[],
  IOError | ValidationError | InvalidJsonError | FileNotFound
>

export type SaveTemplatesRepository = (
  templates: Template[]
) => ResultAsync<void, IOError | SerializeError>
