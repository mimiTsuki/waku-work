import type { ResultAsync } from 'neverthrow'
import type { Project } from './domain'
import { IOError } from '../file/error/ioError'
import { ValidationError } from '../utils/zod'
import { InvalidJsonError } from '../utils/json/parse'
import { FileNotFound } from '../file/error/fileNotFound'
import { SerializeError } from '../utils/json/serialize'

export type ListProjectsRepository = () => ResultAsync<
  Project[],
  IOError | ValidationError | InvalidJsonError | FileNotFound
>

export type SaveProjectsRepository = (
  projects: Project[]
) => ResultAsync<void, IOError | SerializeError>
