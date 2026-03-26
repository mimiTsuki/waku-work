import { ipcMain } from 'electron'
import { ok } from 'neverthrow'
import { z } from 'zod'
import { PROJECT_CHANNELS } from '../../shared/projects'
import { IpcErr, IpcOk } from '../../shared/result'
import { createLogger } from '@core/utils/logger'

const logger = createLogger('ProjectController')
import { validate } from '@core/utils/zod'
import { Project } from '@core/project/domain'
import type { ListProjectsUsecase, SaveProjectsUsecase } from '@core/project/usecase'

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
        .andTee((v) =>
          logger.debug('プロジェクト一覧の取得に成功しました。', {
            'ipc.channel': PROJECT_CHANNELS.READ,
            'ipc.output': v
          })
        )
        .orTee((e) =>
          logger.error('プロジェクト一覧の取得に失敗しました。', {
            'ipc.channel': PROJECT_CHANNELS.READ,
            'ipc.error': e
          })
        )
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
        .andTee((v) =>
          logger.debug('プロジェクト一覧の保存に成功しました。', {
            'ipc.channel': PROJECT_CHANNELS.WRITE,
            'ipc.output': v
          })
        )
        .andTee(() =>
          logger.info('プロジェクト一覧の保存に成功しました。', {
            'ipc.channel': PROJECT_CHANNELS.WRITE
          })
        )
        .orTee((e) =>
          logger.error('プロジェクト一覧の保存に失敗しました。', {
            'ipc.channel': PROJECT_CHANNELS.WRITE,
            'ipc.error': e
          })
        )
        .match(IpcOk.of, IpcErr.of)
    )
  }
}
