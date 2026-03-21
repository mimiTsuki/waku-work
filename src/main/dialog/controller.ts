import { ipcMain, dialog } from 'electron'
import { okAsync } from 'neverthrow'
import { DIALOG_CHANNELS } from '../../shared/dialog'
import { createLogger } from '../utils/logger'

const logger = createLogger('DialogController')

// TODO: 設計見直し
export const DialogController = {
  of: (): void => {
    ipcMain.handle(DIALOG_CHANNELS.SELECT_FOLDER, () =>
      okAsync(undefined)
        .andTee(() =>
          logger.debug('IPCハンドラが呼び出されました。', {
            'ipc.channel': DIALOG_CHANNELS.SELECT_FOLDER
          })
        )
        .map(async () => {
          const result = await dialog.showOpenDialog({ properties: ['openDirectory'] })
          if (result.canceled || result.filePaths.length === 0) return null
          return result.filePaths[0]
        })
    )
  }
}
