import z from 'zod'
import { BaseError } from '../error'
import { Result } from 'neverthrow'

const type = 'SERIALIZE_ERROR' as const

const schema = BaseError.schema.extend({
  type: z.literal(type)
})

export const SerializeError = {
  type,
  schema,
  fromMessage: (message: string) => schema.parse({ type, message })
} as const

export type SerializeError = z.infer<typeof schema>

export const jsonSerialize: (value: unknown) => Result<string, SerializeError> =
  Result.fromThrowable(
    (value) => JSON.stringify(value, null, 2),
    (e) => SerializeError.fromMessage(String(e))
  )
