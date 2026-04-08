import { fromIpcResult } from '@renderer/shared/lib/ipc'
import type { IpcError, IpcResult } from '@shared/result'
import type { Result } from 'neverthrow'

export async function fetchApi<T>(path: string, init?: RequestInit): Promise<Result<T, IpcError>> {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init
  })
  const body: IpcResult<T> = await res.json()
  return fromIpcResult(body)
}
