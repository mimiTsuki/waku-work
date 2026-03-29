import { z } from 'zod'
import type { IpcResult } from './result'

export const templateEntrySchema = z.object({
  id: z.uuid(),
  projectId: z.uuid(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  description: z.string()
})

export const templateSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  entries: z.array(templateEntrySchema)
})

export type Template = z.infer<typeof templateSchema>

export const TEMPLATE_CHANNELS = {
  READ: 'templates:read',
  WRITE: 'templates:write'
} as const

export type SaveTemplatesRequest = Template[]

export type ListTemplatesResponse = IpcResult<Template[]>
export type SaveTemplatesResponse = IpcResult<void>
