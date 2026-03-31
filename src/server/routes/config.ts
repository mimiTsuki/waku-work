import { Hono } from 'hono'
import { ok } from 'neverthrow'
import type { GetConfigUsecase, SaveConfigUsecase } from '@core/config/usecase'
import { IpcOk, IpcErr } from '../../shared/result'
import { validate } from '@core/utils/zod'
import { AppConfig } from '@core/config/domain'
import { createLogger } from '@core/utils/logger'

const logger = createLogger('ConfigRoute')

type ConfigRoutesDeps = {
  getConfigUsecase: GetConfigUsecase
  saveConfigUsecase: SaveConfigUsecase
}

export function configRoutes({ getConfigUsecase, saveConfigUsecase }: ConfigRoutesDeps): Hono {
  const app = new Hono()

  app.get('/config', async (c) => {
    return ok(undefined)
      .andTee(() =>
        logger.debug('リクエストを受信しました。', {
          'http.route': 'GET /config'
        })
      )
      .asyncAndThen(() => getConfigUsecase())
      .andTee((v) =>
        logger.debug('設定の取得に成功しました。', {
          'http.route': 'GET /config',
          'http.output': v
        })
      )
      .orTee((e) =>
        logger.error('設定の取得に失敗しました。', {
          'http.route': 'GET /config',
          'http.error': e
        })
      )
      .then((result) => c.json(result.match(IpcOk.of, IpcErr.of)))
  })

  app.put('/config', async (c) => {
    const body = await c.req.json()
    return ok(body)
      .andTee((v) =>
        logger.debug('リクエストを受信しました。', {
          'http.route': 'PUT /config',
          'http.input': v
        })
      )
      .andThen(validate(AppConfig.schema))
      .asyncAndThen(saveConfigUsecase)
      .andTee((v) =>
        logger.debug('設定の保存に成功しました。', {
          'http.route': 'PUT /config',
          'http.output': v
        })
      )
      .andTee(() =>
        logger.info('設定の保存に成功しました。', {
          'http.route': 'PUT /config'
        })
      )
      .orTee((e) =>
        logger.error('設定の保存に失敗しました。', {
          'http.route': 'PUT /config',
          'http.error': e
        })
      )
      .then((result) => c.json(result.match(IpcOk.of, IpcErr.of)))
  })

  return app
}
