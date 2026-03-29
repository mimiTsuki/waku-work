import { ipcMain } from 'electron'
import { ok } from 'neverthrow'
import { z } from 'zod'
import { TEMPLATE_CHANNELS } from '../../shared/templates'
import { IpcErr, IpcOk } from '../../shared/result'
import { createLogger } from '@core/utils/logger'

const logger = createLogger('TemplateController')
import { validate } from '@core/utils/zod'
import { Template } from '@core/template/domain'
import type { ListTemplatesUsecase, SaveTemplatesUsecase } from '@core/template/usecase'

const saveTemplatesInputSchema = z.array(Template.schema)

type TemplateControllerDeps = {
  listTemplatesUsecase: ListTemplatesUsecase
  saveTemplatesUsecase: SaveTemplatesUsecase
}

export const TemplateController = {
  of: ({ listTemplatesUsecase, saveTemplatesUsecase }: TemplateControllerDeps): void => {
    ipcMain.handle(TEMPLATE_CHANNELS.READ, () =>
      ok(undefined)
        .andTee(() =>
          logger.debug('IPCハンドラが呼び出されました。', {
            'ipc.channel': TEMPLATE_CHANNELS.READ
          })
        )
        .asyncAndThen(() => listTemplatesUsecase())
        .andTee((v) =>
          logger.debug('テンプレート一覧の取得に成功しました。', {
            'ipc.channel': TEMPLATE_CHANNELS.READ,
            'ipc.output': v
          })
        )
        .orTee((e) =>
          logger.error('テンプレート一覧の取得に失敗しました。', {
            'ipc.channel': TEMPLATE_CHANNELS.READ,
            'ipc.error': e
          })
        )
        .match(IpcOk.of, IpcErr.of)
    )

    ipcMain.handle(TEMPLATE_CHANNELS.WRITE, (_, args: unknown) =>
      ok(args)
        .andTee((v) =>
          logger.debug('IPCハンドラが呼び出されました。', {
            'ipc.channel': TEMPLATE_CHANNELS.WRITE,
            'ipc.input': v
          })
        )
        .andThen(validate(saveTemplatesInputSchema))
        .asyncAndThen(saveTemplatesUsecase)
        .andTee((v) =>
          logger.debug('テンプレート一覧の保存に成功しました。', {
            'ipc.channel': TEMPLATE_CHANNELS.WRITE,
            'ipc.output': v
          })
        )
        .andTee(() =>
          logger.info('テンプレート一覧の保存に成功しました。', {
            'ipc.channel': TEMPLATE_CHANNELS.WRITE
          })
        )
        .orTee((e) =>
          logger.error('テンプレート一覧の保存に失敗しました。', {
            'ipc.channel': TEMPLATE_CHANNELS.WRITE,
            'ipc.error': e
          })
        )
        .match(IpcOk.of, IpcErr.of)
    )
  }
}
