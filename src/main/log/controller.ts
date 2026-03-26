import { ipcMain } from 'electron'
import { ok } from 'neverthrow'
import { LOG_CHANNELS } from '../../shared/logs'
import { IpcErr, IpcOk } from '../../shared/result'
import { createLogger } from '@core/utils/logger'

const logger = createLogger('LogController')
import { validate } from '@core/utils/zod'
import {
  ListLogsInput,
  MoveLogEntryInput,
  SaveLogsInput,
  type ListLogsUsecase,
  type MoveLogEntryUsecase,
  type SaveLogsUsecase
} from '@core/log/usecase'

type LogControllerDeps = {
  listLogsUsecase: ListLogsUsecase
  saveLogsUsecase: SaveLogsUsecase
  moveLogEntryUsecase: MoveLogEntryUsecase
}

export const LogController = {
  of: ({ listLogsUsecase, saveLogsUsecase, moveLogEntryUsecase }: LogControllerDeps): void => {
    ipcMain.handle(LOG_CHANNELS.READ, (_, args: unknown) =>
      ok(args)
        .andTee((v) =>
          logger.debug('IPCハンドラが呼び出されました。', {
            'ipc.channel': LOG_CHANNELS.READ,
            'ipc.input': v
          })
        )
        .andThen(validate(ListLogsInput.schema))
        .asyncAndThen(listLogsUsecase)
        .andTee((v) =>
          logger.debug('作業ログの取得に成功しました。', {
            'ipc.channel': LOG_CHANNELS.READ,
            'ipc.output': v
          })
        )
        .orTee((e) =>
          logger.error('作業ログの取得に失敗しました。', {
            'ipc.channel': LOG_CHANNELS.READ,
            'ipc.error': e
          })
        )
        .match(IpcOk.of, IpcErr.of)
    )

    ipcMain.handle(LOG_CHANNELS.WRITE, (_, args: unknown) =>
      ok(args)
        .andTee((v) =>
          logger.debug('IPCハンドラが呼び出されました。', {
            'ipc.channel': LOG_CHANNELS.WRITE,
            'ipc.input': v
          })
        )
        .andThen(validate(SaveLogsInput.schema))
        .asyncAndThen(saveLogsUsecase)
        .andTee((v) =>
          logger.debug('作業ログの保存に成功しました。', {
            'ipc.channel': LOG_CHANNELS.WRITE,
            'ipc.output': v
          })
        )
        .andTee(() =>
          logger.info('作業ログの保存に成功しました。', {
            'ipc.channel': LOG_CHANNELS.WRITE
          })
        )
        .orTee((e) =>
          logger.error('作業ログの保存に失敗しました。', {
            'ipc.channel': LOG_CHANNELS.WRITE,
            'ipc.error': e
          })
        )
        .match(IpcOk.of, IpcErr.of)
    )

    ipcMain.handle(LOG_CHANNELS.MOVE, (_, args: unknown) =>
      ok(args)
        .andTee((v) =>
          logger.debug('IPCハンドラが呼び出されました。', {
            'ipc.channel': LOG_CHANNELS.MOVE,
            'ipc.input': v
          })
        )
        .andThen(validate(MoveLogEntryInput.schema))
        .asyncAndThen(moveLogEntryUsecase)
        .andTee((v) =>
          logger.debug('作業ログの移動に成功しました。', {
            'ipc.channel': LOG_CHANNELS.MOVE,
            'ipc.output': v
          })
        )
        .andTee(() =>
          logger.info('作業ログの移動に成功しました。', {
            'ipc.channel': LOG_CHANNELS.MOVE
          })
        )
        .orTee((e) =>
          logger.error('作業ログの移動に失敗しました。', {
            'ipc.channel': LOG_CHANNELS.MOVE,
            'ipc.error': e
          })
        )
        .match(IpcOk.of, IpcErr.of)
    )
  }
}
