import { ipcMain } from 'electron'
import { ok } from 'neverthrow'
import { LOG_CHANNELS } from '../../shared/logs'
import { IpcErr, IpcOk } from '../../shared/result'
import { createLogger } from '../utils/logger'

const logger = createLogger('LogController')
import { validate } from '../utils/zod'
import {
  ListLogsInput,
  MoveLogEntryInput,
  SaveLogsInput,
  type ListLogsUsecase,
  type MoveLogEntryUsecase,
  type SaveLogsUsecase
} from './usecase'

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
        .match(IpcOk.of, IpcErr.of)
    )
  }
}
