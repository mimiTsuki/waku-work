import type { Result } from 'neverthrow'
import type { Config } from '@shared/config'
import type { IpcError } from '@shared/result'
import { fromIpcResult } from '@renderer/lib/ipcUtils'

export async function readConfig(): Promise<Result<Config, IpcError>> {
  return fromIpcResult(await window.api.getConfig())
}

export async function writeConfig(config: Config): Promise<Result<void, IpcError>> {
  return fromIpcResult(await window.api.saveConfig(config))
}

export async function selectFolder(): Promise<string | null> {
  return window.api.selectFolder()
}
