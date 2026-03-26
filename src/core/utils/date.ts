import { z } from 'zod'

const dateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)

export type DateString = z.infer<typeof dateStringSchema>

const timeStringSchema = z.string().regex(/^\d{2}:\d{2}$/)

export type TimeString = z.infer<typeof timeStringSchema>

const isoDateTimeSchema = z.iso.datetime()

export type IsoDateTime = z.infer<typeof isoDateTimeSchema>

export const DateString = {
  create: (v: string): DateString => dateStringSchema.parse(v),
  schema: dateStringSchema
}

export const TimeString = {
  create: (v: string): TimeString => timeStringSchema.parse(v),
  schema: timeStringSchema
}

export const IsoDateTime = {
  create: (v: string): IsoDateTime => isoDateTimeSchema.parse(v),
  schema: isoDateTimeSchema
}
