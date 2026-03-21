import { z } from 'zod'

const schema = z.object({
  dataDir: z.string()
})

export type AppConfig = z.infer<typeof schema>

export const AppConfig = {
  schema
}

export type ConfigError = { type: 'config-invalid'; message: string }
