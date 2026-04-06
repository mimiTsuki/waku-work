import type { Result } from 'neverthrow'
import type { LogEntry } from '@shared/logs'
import type { IpcError } from '@shared/result'
import { fromIpcResult } from '@renderer/shared/lib/ipc'

export async function readLogs(year: number, month: number): Promise<Result<LogEntry[], IpcError>> {
  return fromIpcResult(await window.api.listLogs({ year, month }))
}

export async function writeLogs(
  year: number,
  month: number,
  logs: LogEntry[]
): Promise<Result<void, IpcError>> {
  return fromIpcResult(await window.api.saveLogs({ year, month, logs }))
}

export async function moveLogEntry(
  entryId: string,
  fromYear: number,
  fromMonth: number,
  toYear: number,
  toMonth: number,
  entry: LogEntry
): Promise<Result<void, IpcError>> {
  return fromIpcResult(
    await window.api.moveLogEntry({ entryId, fromYear, fromMonth, toYear, toMonth, entry })
  )
}
