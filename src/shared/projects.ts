import { z } from 'zod'
import type { IpcResult } from './result'

export const projectSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  color: z.string(),
  archived: z.boolean()
})

export type Project = z.infer<typeof projectSchema>

export const PROJECT_CHANNELS = {
  READ: 'projects:read',
  WRITE: 'projects:write'
} as const

export type SaveProjectsRequest = Project[]

export type ListProjectsResponse = IpcResult<Project[]>
export type SaveProjectsResponse = IpcResult<void>
