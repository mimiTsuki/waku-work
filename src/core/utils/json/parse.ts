import { Result } from 'neverthrow'
import { BaseError } from '../error'
import z from 'zod'

const type = 'INVALID_JSON_ERROR' as const

const schema = BaseError.schema.extend({
  type: z.literal(type)
})

export const InvalidJsonError = {
  type,
  schema,
  fromMessage: (message: string) => schema.parse({ type, message })
} as const

export type InvalidJsonError = z.infer<typeof schema>

export const jsonParse: (json: string) => Result<unknown, InvalidJsonError> = Result.fromThrowable(
  JSON.parse,
  (e) => InvalidJsonError.fromMessage(String(e))
)
