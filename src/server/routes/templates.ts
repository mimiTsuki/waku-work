import { Hono } from 'hono'
import { z } from 'zod'
import type { ListTemplatesUsecase, SaveTemplatesUsecase } from '@core/template/usecase'
import { IpcOk, IpcErr } from '../../shared/result'
import { validate } from '@core/utils/zod'
import { Template } from '@core/template/domain'

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
    const result = await listTemplatesUsecase()
    return c.json(result.match(IpcOk.of, IpcErr.of))
  })

  app.put('/templates', async (c) => {
    const body = await c.req.json()
    const validated = validate(z.array(Template.schema))(body)
    if (validated.isErr()) return c.json(IpcErr.of(validated.error))
    const result = await saveTemplatesUsecase(validated.value)
    return c.json(result.match(IpcOk.of, IpcErr.of))
  })

  return app
}
