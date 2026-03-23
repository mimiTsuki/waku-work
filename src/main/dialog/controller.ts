import { ipcMain, dialog } from 'electron'
import { ResultAsync } from 'neverthrow'
import { DIALOG_CHANNELS } from '../../shared/dialog'
import { createLogger } from '../utils/logger'

const logger = createLogger('DialogController')

// TODO: 設計見直し
export const DialogController = {
  of: (): void => {
    ipcMain.handle(DIALOG_CHANNELS.SELECT_FOLDER, () =>
      ResultAsync.fromSafePromise(Promise.resolve(undefined))
        .andTee(() =>
          logger.debug('IPCハンドラが呼び出されました。', {
            'ipc.channel': DIALOG_CHANNELS.SELECT_FOLDER
          })
        )
        .andThen(() =>
          ResultAsync.fromPromise(
            dialog.showOpenDialog({ properties: ['openDirectory'] }),
            (e) => e
          )
        )
        .map((result) => {
          if (result.canceled || result.filePaths.length === 0) return null
          return result.filePaths[0]
        })
        .andTee((v) =>
          logger.debug('フォルダ選択ダイアログが完了しました。', {
            'ipc.channel': DIALOG_CHANNELS.SELECT_FOLDER,
            'ipc.output': v
          })
        )
        .orTee((e) =>
          logger.error('フォルダ選択ダイアログでエラーが発生しました。', {
            'ipc.channel': DIALOG_CHANNELS.SELECT_FOLDER,
            'ipc.error': e
          })
        )
        .match(
          (v) => v,
          () => null
        )
    )
  }
}
