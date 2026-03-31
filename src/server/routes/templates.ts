import { Hono } from 'hono'
import { z } from 'zod'
import { ok } from 'neverthrow'
import type { ListTemplatesUsecase, SaveTemplatesUsecase } from '@core/template/usecase'
import { IpcOk, IpcErr } from '../../shared/result'
import { validate } from '@core/utils/zod'
import { Template } from '@core/template/domain'
import { createLogger } from '@core/utils/logger'

const logger = createLogger('TemplatesRoute')

type TemplatesRoutesDeps = {
  listTemplatesUsecase: ListTemplatesUsecase
  saveTemplatesUsecase: SaveTemplatesUsecase
}

export function templatesRoutes({
  listTemplatesUsecase,
  saveTemplatesUsecase
}: TemplatesRoutesDeps): Hono {
  const app = new Hono()

  app.get('/templates', async (c) => {
    return ok(undefined)
      .andTee(() =>
        logger.debug('リクエストを受信しました。', {
          'http.route': 'GET /templates'
        })
      )
      .asyncAndThen(() => listTemplatesUsecase())
      .andTee((v) =>
        logger.debug('テンプレート一覧の取得に成功しました。', {
          'http.route': 'GET /templates',
          'http.output': v
        })
      )
      .orTee((e) =>
        logger.error('テンプレート一覧の取得に失敗しました。', {
          'http.route': 'GET /templates',
          'http.error': e
        })
      )
      .then((result) => c.json(result.match(IpcOk.of, IpcErr.of)))
  })

  app.put('/templates', async (c) => {
    const body = await c.req.json()
    return ok(body)
      .andTee((v) =>
        logger.debug('リクエストを受信しました。', {
          'http.route': 'PUT /templates',
          'http.input': v
        })
      )
      .andThen(validate(z.array(Template.schema)))
      .asyncAndThen(saveTemplatesUsecase)
      .andTee((v) =>
        logger.debug('テンプレート一覧の保存に成功しました。', {
          'http.route': 'PUT /templates',
          'http.output': v
        })
      )
      .andTee(() =>
        logger.info('テンプレート一覧の保存に成功しました。', {
          'http.route': 'PUT /templates'
        })
      )
      .orTee((e) =>
        logger.error('テンプレート一覧の保存に失敗しました。', {
          'http.route': 'PUT /templates',
          'http.error': e
        })
      )
      .then((result) => c.json(result.match(IpcOk.of, IpcErr.of)))
  })

  return app
}
