import { ipcMain } from 'electron'
import { ok } from 'neverthrow'
import { CONFIG_CHANNELS } from '../../shared/config'
import { IpcErr, IpcOk } from '../../shared/result'
import { createLogger } from '../utils/logger'

const logger = createLogger('ConfigController')
import { validate } from '../utils/zod'
import { AppConfig } from './domain'
import type { GetConfigUsecase, SaveConfigUsecase } from './usecase'

type ConfigControllerDeps = {
  getConfigUsecase: GetConfigUsecase
  saveConfigUsecase: SaveConfigUsecase
}

export const ConfigController = {
  of: ({ getConfigUsecase, saveConfigUsecase }: ConfigControllerDeps): void => {
    ipcMain.handle(CONFIG_CHANNELS.READ, () =>
      ok(undefined)
        .andTee(() =>
          logger.debug('IPCハンドラが呼び出されました。', {
            'ipc.channel': CONFIG_CHANNELS.READ
          })
        )
        .asyncAndThen(() => getConfigUsecase())
        .andTee((v) =>
          logger.debug('設定の取得に成功しました。', {
            'ipc.channel': CONFIG_CHANNELS.READ,
            'ipc.output': v
          })
        )
        .orTee((e) =>
          logger.error('設定の取得に失敗しました。', {
            'ipc.channel': CONFIG_CHANNELS.READ,
            'ipc.error': e
          })
        )
        .match(IpcOk.of, IpcErr.of)
    )

    ipcMain.handle(CONFIG_CHANNELS.WRITE, (_, args: unknown) =>
      ok(args)
        .andTee((v) =>
          logger.debug('IPCハンドラが呼び出されました。', {
            'ipc.channel': CONFIG_CHANNELS.WRITE,
            'ipc.input': v
          })
        )
        .andThen(validate(AppConfig.schema))
        .asyncAndThen(saveConfigUsecase)
        .andTee((v) =>
          logger.info('設定の保存に成功しました。', {
            'ipc.channel': CONFIG_CHANNELS.WRITE,
            'ipc.output': v
          })
        )
        .orTee((e) =>
          logger.error('設定の保存に失敗しました。', {
            'ipc.channel': CONFIG_CHANNELS.WRITE,
            'ipc.error': e
          })
        )
        .match(IpcOk.of, IpcErr.of)
    )
  }
}
