import { startOfWeek, addDays, format, parse, parseISO, eachMonthOfInterval } from 'date-fns'

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function durationMinutes(start: string, end: string): number {
  return timeToMinutes(end) - timeToMinutes(start)
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h}:${String(m).padStart(2, '0')}`
}

export function getWeekStart(date: Date, weekStartOnMonday: boolean = true): Date {
  return startOfWeek(date, { weekStartsOn: weekStartOnMonday ? 1 : 0 })
}

export function getWeekDays(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
}

export function formatDateKey(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

export function parseDateKey(key: string): Date {
  return parse(key, 'yyyy-MM-dd', new Date())
}

export function getYearMonth(dateKey: string): { year: number; month: number } {
  const [year, month] = dateKey.split('-').map(Number)
  return { year, month }
}

export function getMonthsInRange(
  startDate: string,
  endDate: string
): Array<{ year: number; month: number }> {
  return eachMonthOfInterval({ start: parseISO(startDate), end: parseISO(endDate) }).map((d) => ({
    year: d.getFullYear(),
    month: d.getMonth() + 1
  }))
}
