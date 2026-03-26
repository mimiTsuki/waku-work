import { Hono } from 'hono'
import { z } from 'zod'
import type { ListProjectsUsecase, SaveProjectsUsecase } from '@core/project/usecase'
import { IpcOk, IpcErr } from '../../shared/result'
import { validate } from '@core/utils/zod'
import { Project } from '@core/project/domain'

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
    const result = await listProjectsUsecase()
    return c.json(result.match(IpcOk.of, IpcErr.of))
  })

  app.put('/projects', async (c) => {
    const body = await c.req.json()
    const validated = validate(z.array(Project.schema))(body)
    if (validated.isErr()) return c.json(IpcErr.of(validated.error))
    const result = await saveProjectsUsecase(validated.value)
    return c.json(result.match(IpcOk.of, IpcErr.of))
  })

  return app
}
