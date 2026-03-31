import { Hono } from 'hono'
import { z } from 'zod'
import { ok } from 'neverthrow'
import type { ListProjectsUsecase, SaveProjectsUsecase } from '@core/project/usecase'
import { IpcOk, IpcErr } from '../../shared/result'
import { validate } from '@core/utils/zod'
import { Project } from '@core/project/domain'
import { createLogger } from '@core/utils/logger'

const logger = createLogger('ProjectsRoute')

type ProjectsRoutesDeps = {
  listProjectsUsecase: ListProjectsUsecase
  saveProjectsUsecase: SaveProjectsUsecase
}

export function projectsRoutes({
  listProjectsUsecase,
  saveProjectsUsecase
}: ProjectsRoutesDeps): Hono {
  const app = new Hono()

  app.get('/projects', async (c) => {
    return ok(undefined)
      .andTee(() =>
        logger.debug('リクエストを受信しました。', {
          'http.route': 'GET /projects'
        })
      )
      .asyncAndThen(() => listProjectsUsecase())
      .andTee((v) =>
        logger.debug('プロジェクト一覧の取得に成功しました。', {
          'http.route': 'GET /projects',
          'http.output': v
        })
      )
      .orTee((e) =>
        logger.error('プロジェクト一覧の取得に失敗しました。', {
          'http.route': 'GET /projects',
          'http.error': e
        })
      )
      .then((result) => c.json(result.match(IpcOk.of, IpcErr.of)))
  })

  app.put('/projects', async (c) => {
    const body = await c.req.json()
    return ok(body)
      .andTee((v) =>
        logger.debug('リクエストを受信しました。', {
          'http.route': 'PUT /projects',
          'http.input': v
        })
      )
      .andThen(validate(z.array(Project.schema)))
      .asyncAndThen(saveProjectsUsecase)
      .andTee((v) =>
        logger.debug('プロジェクト一覧の保存に成功しました。', {
          'http.route': 'PUT /projects',
          'http.output': v
        })
      )
      .andTee(() =>
        logger.info('プロジェクト一覧の保存に成功しました。', {
          'http.route': 'PUT /projects'
        })
      )
      .orTee((e) =>
        logger.error('プロジェクト一覧の保存に失敗しました。', {
          'http.route': 'PUT /projects',
          'http.error': e
        })
      )
      .then((result) => c.json(result.match(IpcOk.of, IpcErr.of)))
  })

  return app
}
