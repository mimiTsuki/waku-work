import { z } from 'zod'
import { TimeString } from '../utils/date'
import { UUID } from '../utils/uuid'

const entrySchema = z.object({
  id: UUID.schema,
  projectId: UUID.schema,
  startTime: TimeString.schema,
  endTime: TimeString.schema,
  description: z.string()
})

export type TemplateEntry = z.infer<typeof entrySchema>

export const TemplateEntry = {
  schema: entrySchema
}

const schema = z.object({
  id: UUID.schema,
  name: z.string(),
  entries: z.array(entrySchema)
})

export type Template = z.infer<typeof schema>

export const Template = {
  schema
}
