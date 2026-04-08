import type { LogEntry } from '@shared/logs'
import type { IpcError } from '@shared/result'
import type { Result } from 'neverthrow'
import { fetchApi } from './fetch'

export async function readLogs(year: number, month: number): Promise<Result<LogEntry[], IpcError>> {
  return fetchApi<LogEntry[]>(`/logs?year=${year}&month=${month}`)
}

export async function writeLogs(
  year: number,
  month: number,
  logs: LogEntry[]
): Promise<Result<void, IpcError>> {
  return fetchApi<void>('/logs', { method: 'PUT', body: JSON.stringify({ year, month, logs }) })
}

export async function moveLogEntry(
  entryId: string,
  fromYear: number,
  fromMonth: number,
  toYear: number,
  toMonth: number,
  entry: LogEntry
): Promise<Result<void, IpcError>> {
  return fetchApi<void>('/logs/move', {
    method: 'POST',
    body: JSON.stringify({ entryId, fromYear, fromMonth, toYear, toMonth, entry })
  })
}
