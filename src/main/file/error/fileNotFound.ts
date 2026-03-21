import z from 'zod'
import { BaseError } from '../../utils/error'

const type = 'FILE_NOT_FOUND' as const

const schema = BaseError.schema.extend({
  type: z.literal(type)
})

export const FileNotFound = {
  type,
  schema,
  fromMessage: (message: string) => schema.parse({ type, message })
} as const

export type FileNotFound = z.infer<typeof schema>
