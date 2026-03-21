import { z } from 'zod'
import type { IpcResult } from './result'

export const appConfigSchema = z.object({
  dataDir: z.string()
})

export type Config = z.infer<typeof appConfigSchema>

export const CONFIG_CHANNELS = {
  READ: 'config:read',
  WRITE: 'config:write'
} as const

export type SaveConfigRequest = Config

export type GetConfigResponse = IpcResult<Config>
export type SaveConfigResponse = IpcResult<void>
