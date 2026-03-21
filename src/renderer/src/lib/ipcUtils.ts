import { Result, ok, err } from 'neverthrow'
import type { IpcResult, IpcError } from '@shared/result'

export function fromIpcResult<T>(result: IpcResult<T>): Result<T, IpcError> {
  return result.kind === 'success' ? ok(result.data) : err(result.error)
}
