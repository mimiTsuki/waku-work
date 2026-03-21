import { ResultAsync } from 'neverthrow'
import { Project } from './domain'
import type { ListProjectsRepository, SaveProjectsRepository } from './repository'
import { IOError } from '../file/error/ioError'
import { ValidationError } from '../utils/zod'
import { InvalidJsonError } from '../utils/json/parse'
import { FileNotFound } from '../file/error/fileNotFound'
import { SerializeError } from '../utils/json/serialize'

export type ListProjectsUsecase = () => ResultAsync<
  Project[],
  IOError | ValidationError | InvalidJsonError | FileNotFound
>

export type SaveProjectsUsecase = (
  projects: Project[]
) => ResultAsync<void, IOError | SerializeError>

type ListProjectsUsecaseDeps = {
  listProjects: ListProjectsRepository
}

export const ListProjectsUsecase = {
  of:
    ({ listProjects }: ListProjectsUsecaseDeps): ListProjectsUsecase =>
    () => {
      return listProjects()
    }
}

type SaveProjectsUsecaseDeps = {
  writeProjects: SaveProjectsRepository
}

export const SaveProjectsUsecase = {
  of:
    ({ writeProjects }: SaveProjectsUsecaseDeps): SaveProjectsUsecase =>
    (projects: Project[]) => {
      return writeProjects(projects)
    }
}
