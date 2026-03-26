import z from 'zod'
import { BaseError } from '../../utils/error'

const type = 'IO_ERROR' as const

const schema = BaseError.schema.extend({
  type: z.literal(type)
})

export const IOError = {
  type,
  schema,
  fromMessage: (message: string) => schema.parse({ type: type, message })
} as const

export type IOError = z.infer<typeof schema>
