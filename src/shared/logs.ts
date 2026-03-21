import { z } from 'zod'
import type { IpcResult } from './result'

export const logEntrySchema = z.object({
  id: z.uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  projectId: z.uuid(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  memo: z.string(),
  createdAt: z.iso.datetime()
})

export type LogEntry = z.infer<typeof logEntrySchema>

export const LOG_CHANNELS = {
  READ: 'logs:read',
  WRITE: 'logs:write',
  MOVE: 'logs:move'
} as const

export type ListLogsRequest = { year: number; month: number }
export type SaveLogsRequest = { year: number; month: number; logs: LogEntry[] }
export type MoveLogEntryRequest = {
  entryId: string
  fromYear: number
  fromMonth: number
  toYear: number
  toMonth: number
  entry: LogEntry
}

export type ListLogsResponse = IpcResult<LogEntry[]>
export type SaveLogsResponse = IpcResult<void>
export type MoveLogEntryResponse = IpcResult<void>
