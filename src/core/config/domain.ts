import { z } from 'zod'

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

const schema = z.object({
  dataDir: z.string(),
  theme: themeSchema.default(themeTypes.SYSTEM),
  weekStartOnMonday: z.boolean().default(true)
})

export type AppConfig = z.infer<typeof schema>

export const AppConfig = {
  schema
}

export type ConfigError = { type: 'config-invalid'; message: string }
