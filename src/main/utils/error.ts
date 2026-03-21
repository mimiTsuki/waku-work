import z from 'zod'

const schema = z.object({
  type: z.string(),
  message: z.string()
})

/**
 * アプリケーション内で取り扱うエラーの基底型
 */
export const BaseError = {
  schema
}

export type BaseError = z.infer<typeof schema>

export function isErrnoException(e: unknown): e is NodeJS.ErrnoException {
  return e instanceof Error && 'code' in e && typeof (e as NodeJS.ErrnoException).code === 'string'
}
