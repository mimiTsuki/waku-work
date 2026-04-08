import type { Config } from '@shared/config'
import type { IpcError } from '@shared/result'
import type { Result } from 'neverthrow'
import { fetchApi } from './fetch'

export async function readConfig(): Promise<Result<Config, IpcError>> {
  return fetchApi<Config>('/config')
}

export async function writeConfig(config: Config): Promise<Result<void, IpcError>> {
  return fetchApi<void>('/config', { method: 'PUT', body: JSON.stringify(config) })
}
