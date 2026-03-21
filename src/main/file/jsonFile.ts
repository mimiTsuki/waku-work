import { type ResultAsync } from 'neverthrow'
import type { ZodType } from 'zod'

import { InvalidJsonError, jsonParse } from '../utils/json/parse'
import { validate, ValidationError } from '../utils/zod'
import { FileNotFound } from './error/fileNotFound'
import { IOError } from './error/ioError'
import { safeReadFile } from './file'

export const readJsonFile = <T>(
  filePath: string,
  schema: ZodType<T>
): ResultAsync<T, IOError | ValidationError | InvalidJsonError | FileNotFound> =>
  safeReadFile(filePath).andThen(jsonParse).andThen(validate(schema))
