import { Hono } from 'hono'
import type { ListLogsUsecase, SaveLogsUsecase, MoveLogEntryUsecase } from '@core/log/usecase'
import { IpcOk, IpcErr } from '../../shared/result'
import { validate } from '@core/utils/zod'
import { ListLogsInput, SaveLogsInput, MoveLogEntryInput } from '@core/log/usecase'

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
    const validated = validate(ListLogsInput.schema)({ year, month })
    if (validated.isErr()) return c.json(IpcErr.of(validated.error))
    const result = await listLogsUsecase(validated.value)
    return c.json(result.match(IpcOk.of, IpcErr.of))
  })

  app.put('/logs', async (c) => {
    const body = await c.req.json()
    const validated = validate(SaveLogsInput.schema)(body)
    if (validated.isErr()) return c.json(IpcErr.of(validated.error))
    const result = await saveLogsUsecase(validated.value)
    return c.json(result.match(IpcOk.of, IpcErr.of))
  })

  app.post('/logs/move', async (c) => {
    const body = await c.req.json()
    const validated = validate(MoveLogEntryInput.schema)(body)
    if (validated.isErr()) return c.json(IpcErr.of(validated.error))
    const result = await moveLogEntryUsecase(validated.value)
    return c.json(result.match(IpcOk.of, IpcErr.of))
  })

  return app
}
