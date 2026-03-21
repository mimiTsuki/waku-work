import { z } from 'zod'
import { UUID } from '../utils/uuid'

const schema = z.object({
  id: UUID.schema,
  name: z.string(),
  color: z.string(),
  archived: z.boolean()
})

export type Project = z.infer<typeof schema>

export const Project = {
  schema
}

export type ProjectError = { type: 'project-not-found'; projectId: string }
