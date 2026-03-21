import { ipcMain } from 'electron'
import { ok } from 'neverthrow'
import { z } from 'zod'
import { PROJECT_CHANNELS } from '../../shared/projects'
import { IpcErr, IpcOk } from '../../shared/result'
import { createLogger } from '../utils/logger'

const logger = createLogger('ProjectController')
import { validate } from '../utils/zod'
import { Project } from './domain'
import type { ListProjectsUsecase, SaveProjectsUsecase } from './usecase'

const saveProjectsInputSchema = z.array(Project.schema)

type ProjectControllerDeps = {
  listProjectsUsecase: ListProjectsUsecase
  saveProjectsUsecase: SaveProjectsUsecase
}

export const ProjectController = {
  of: ({ listProjectsUsecase, saveProjectsUsecase }: ProjectControllerDeps): void => {
    ipcMain.handle(PROJECT_CHANNELS.READ, () =>
      ok(undefined)
        .andTee(() =>
          logger.debug('IPCハンドラが呼び出されました。', {
            'ipc.channel': PROJECT_CHANNELS.READ
          })
        )
        .asyncAndThen(() => listProjectsUsecase())
        .match(IpcOk.of, IpcErr.of)
    )

    ipcMain.handle(PROJECT_CHANNELS.WRITE, (_, args: unknown) =>
      ok(args)
        .andTee((v) =>
          logger.debug('IPCハンドラが呼び出されました。', {
            'ipc.channel': PROJECT_CHANNELS.WRITE,
            'ipc.input': v
          })
        )
        .andThen(validate(saveProjectsInputSchema))
        .asyncAndThen(saveProjectsUsecase)
        .match(IpcOk.of, IpcErr.of)
    )
  }
}
