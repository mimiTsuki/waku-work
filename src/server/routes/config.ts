import { Hono } from 'hono'
import type { GetConfigUsecase, SaveConfigUsecase } from '@core/config/usecase'
import { IpcOk, IpcErr } from '../../shared/result'
import { validate } from '@core/utils/zod'
import { AppConfig } from '@core/config/domain'

type ConfigRoutesDeps = {
  getConfigUsecase: GetConfigUsecase
  saveConfigUsecase: SaveConfigUsecase
}

export function configRoutes({ getConfigUsecase, saveConfigUsecase }: ConfigRoutesDeps): Hono {
  const app = new Hono()

  app.get('/config', async (c) => {
    const result = await getConfigUsecase()
    return c.json(result.match(IpcOk.of, IpcErr.of))
  })

  app.put('/config', async (c) => {
    const body = await c.req.json()
    const validated = validate(AppConfig.schema)(body)
    if (validated.isErr()) return c.json(IpcErr.of(validated.error))
    const result = await saveConfigUsecase(validated.value)
    return c.json(result.match(IpcOk.of, IpcErr.of))
  })

  return app
}
