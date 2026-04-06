import z from 'zod'
import type { LogEntry } from '@shared/logs'

const timePattern = /^\d{2}:\d{2}$/

export const schema = z
  .object({
    date: z.string(),
    projectId: z.string().min(1, '案件を選択してください'),
    startTime: z.string().regex(timePattern, '時刻形式が不正です'),
    endTime: z.string().regex(timePattern, '時刻形式が不正です'),
    description: z.string().max(500, '説明は500文字以内にしてください')
  })
  .refine((data) => data.startTime < data.endTime, {
    message: '終了時刻は開始より後にしてください',
    path: ['endTime']
  })

export type LogForm = z.infer<typeof schema>

export function logEntryToForm(entry: LogEntry): LogForm {
  return {
    date: entry.date,
    projectId: entry.projectId,
    startTime: entry.startTime,
    endTime: entry.endTime,
    description: entry.description ?? ''
  }
}

export function formToLogEntry(form: LogForm, original?: LogEntry): LogEntry {
  return {
    id: original?.id ?? crypto.randomUUID(),
    date: form.date,
    projectId: form.projectId,
    startTime: form.startTime,
    endTime: form.endTime,
    description: form.description,
    createdAt: original?.createdAt ?? new Date().toISOString()
  }
}
