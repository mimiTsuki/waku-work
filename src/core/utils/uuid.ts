import z from 'zod'

const uuidSchema = z.uuid()

export type UUID = z.infer<typeof uuidSchema>

export const UUID = {
  create: (v: string): UUID => uuidSchema.parse(v),
  schema: uuidSchema
}
