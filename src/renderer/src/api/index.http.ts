import type { Result } from 'neverthrow'
import { ok, err } from 'neverthrow'
import type { LogEntry } from '@shared/logs'
import type { Config } from '@shared/config'
import type { Project } from '@shared/projects'
import type { IpcError, IpcResult } from '@shared/result'

function fromIpcResult<T>(result: IpcResult<T>): Result<T, IpcError> {
  return result.kind === 'success' ? ok(result.data) : err(result.error)
}

async function fetchApi<T>(path: string, init?: RequestInit): Promise<Result<T, IpcError>> {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init
  })
  const body: IpcResult<T> = await res.json()
  return fromIpcResult(body)
}

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

export async function readProjects(): Promise<Result<Project[], IpcError>> {
  return fetchApi<Project[]>('/projects')
}

export async function writeProjects(projects: Project[]): Promise<Result<void, IpcError>> {
  return fetchApi<void>('/projects', { method: 'PUT', body: JSON.stringify(projects) })
}

export async function readConfig(): Promise<Result<Config, IpcError>> {
  return fetchApi<Config>('/config')
}

export async function writeConfig(config: Config): Promise<Result<void, IpcError>> {
  return fetchApi<void>('/config', { method: 'PUT', body: JSON.stringify(config) })
}

export async function selectFolder(): Promise<string | null> {
  return prompt('データディレクトリのパスを入力:')
}

export const IS_ELECTRON = false
