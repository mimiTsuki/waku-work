import { z } from 'zod'
import type { IpcResult } from './result'

export const themeTypes = {
  SYSTEM: 'system',
  LIGHT: 'light',
  DARK: 'dark'
} as const

export const themeSchema = z.union([
  z.literal(themeTypes.SYSTEM),
  z.literal(themeTypes.LIGHT),
  z.literal(themeTypes.DARK)
])

export type Theme = z.infer<typeof themeSchema>

export const appConfigSchema = z.object({
  dataDir: z.string(),
  theme: themeSchema.default(themeTypes.SYSTEM),
  weekStartOnMonday: z.boolean().default(true),
  hourHeight: z.number().int().min(40).max(300).default(100)
})

export type Config = z.infer<typeof appConfigSchema>

export const CONFIG_CHANNELS = {
  READ: 'config:read',
  WRITE: 'config:write'
} as const

export type SaveConfigRequest = Config

export type GetConfigResponse = IpcResult<Config>
export type SaveConfigResponse = IpcResult<void>
