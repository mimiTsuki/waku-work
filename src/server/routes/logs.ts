import { Hono } from 'hono'
import { ok } from 'neverthrow'
import type { ListLogsUsecase, SaveLogsUsecase, MoveLogEntryUsecase } from '@core/log/usecase'
import { IpcOk, IpcErr } from '../../shared/result'
import { validate } from '@core/utils/zod'
import { ListLogsInput, SaveLogsInput, MoveLogEntryInput } from '@core/log/usecase'
import { createLogger } from '@core/utils/logger'

const logger = createLogger('LogsRoute')

type LogsRoutesDeps = {
  listLogsUsecase: ListLogsUsecase
  saveLogsUsecase: SaveLogsUsecase
  moveLogEntryUsecase: MoveLogEntryUsecase
}

export function logsRoutes({
  listLogsUsecase,
  saveLogsUsecase,
  moveLogEntryUsecase
}: LogsRoutesDeps): Hono {
  const app = new Hono()

  app.get('/logs', async (c) => {
    const year = Number(c.req.query('year'))
    const month = Number(c.req.query('month'))
    return ok({ year, month })
      .andTee((v) =>
        logger.debug('リクエストを受信しました。', {
          'http.route': 'GET /logs',
          'http.input': v
        })
      )
      .andThen(validate(ListLogsInput.schema))
      .asyncAndThen(listLogsUsecase)
      .andTee((v) =>
        logger.debug('作業ログの取得に成功しました。', {
          'http.route': 'GET /logs',
          'http.output': v
        })
      )
      .orTee((e) =>
        logger.error('作業ログの取得に失敗しました。', {
          'http.route': 'GET /logs',
          'http.error': e
        })
      )
      .then((result) => c.json(result.match(IpcOk.of, IpcErr.of)))
  })

  app.put('/logs', async (c) => {
    const body = await c.req.json()
    return ok(body)
      .andTee((v) =>
        logger.debug('リクエストを受信しました。', {
          'http.route': 'PUT /logs',
          'http.input': v
        })
      )
      .andThen(validate(SaveLogsInput.schema))
      .asyncAndThen(saveLogsUsecase)
      .andTee((v) =>
        logger.debug('作業ログの保存に成功しました。', {
          'http.route': 'PUT /logs',
          'http.output': v
        })
      )
      .andTee(() =>
        logger.info('作業ログの保存に成功しました。', {
          'http.route': 'PUT /logs'
        })
      )
      .orTee((e) =>
        logger.error('作業ログの保存に失敗しました。', {
          'http.route': 'PUT /logs',
          'http.error': e
        })
      )
      .then((result) => c.json(result.match(IpcOk.of, IpcErr.of)))
  })

  app.post('/logs/move', async (c) => {
    const body = await c.req.json()
    return ok(body)
      .andTee((v) =>
        logger.debug('リクエストを受信しました。', {
          'http.route': 'POST /logs/move',
          'http.input': v
        })
      )
      .andThen(validate(MoveLogEntryInput.schema))
      .asyncAndThen(moveLogEntryUsecase)
      .andTee((v) =>
        logger.debug('作業ログの移動に成功しました。', {
          'http.route': 'POST /logs/move',
          'http.output': v
        })
      )
      .andTee(() =>
        logger.info('作業ログの移動に成功しました。', {
          'http.route': 'POST /logs/move'
        })
      )
      .orTee((e) =>
        logger.error('作業ログの移動に失敗しました。', {
          'http.route': 'POST /logs/move',
          'http.error': e
        })
      )
      .then((result) => c.json(result.match(IpcOk.of, IpcErr.of)))
  })

  return app
}
