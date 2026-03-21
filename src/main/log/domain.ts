import { z } from 'zod'
import { DateString, TimeString, IsoDateTime } from '../utils/date'
import { UUID } from '../utils/uuid'

const schema = z.object({
  id: UUID.schema,
  date: DateString.schema,
  projectId: UUID.schema,
  startTime: TimeString.schema,
  endTime: TimeString.schema,
  memo: z.string(),
  createdAt: IsoDateTime.schema
})

export type LogEntry = z.infer<typeof schema>

export const LogEntry = {
  schema
}

export type LogError = { type: 'log-not-found'; entryId: string }
