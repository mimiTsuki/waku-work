import { err, ok } from 'neverthrow'
import { ZodType } from 'zod'

import z from 'zod'
import { BaseError } from './error'

const type = 'VALIDATION_ERROR' as const

const schema = BaseError.schema.extend({
  type: z.literal(type)
})

export const ValidationError = {
  type,
  schema,
  fromMessage: (message: string) => schema.parse({ type, message })
} as const

export type ValidationError = z.infer<typeof schema>

/**
 * zodスキーマのパース結果をneverthrowのパイプラインで扱うためのアダプター
 */
export const validate =
  <T, E extends BaseError = ValidationError>(schema: ZodType<T>, error?: E) =>
  (value: unknown) => {
    const result = schema.safeParse(value)
    if (result.success) {
      return ok(result.data)
    }

    if (error) {
      return err(error)
    }

    return err(ValidationError.fromMessage(result.error.message))
  }
