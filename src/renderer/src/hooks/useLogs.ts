import { useState, useCallback, useRef } from 'react'
import type { LogEntry } from '@renderer/lib/types'
import { getYearMonth } from '@renderer/lib/timeUtils'

type YearMonthKey = string // "YYYY-MM"

function toKey(year: number, month: number): YearMonthKey {
  return `${year}-${String(month).padStart(2, '0')}`
}

export function useLogs(): {
  fetchMonth: (year: number, month: number) => Promise<LogEntry[]>
  getLogsForDate: (dateKey: string) => LogEntry[]
  addEntry: (entry: LogEntry) => Promise<void>
  updateEntry: (updated: LogEntry, original?: LogEntry) => Promise<void>
  deleteEntry: (entry: LogEntry) => Promise<void>
} {
  const [cache, setCache] = useState<Record<YearMonthKey, LogEntry[]>>({})
  const cacheRef = useRef<Record<YearMonthKey, LogEntry[]>>({})

  const updateCache = useCallback((key: YearMonthKey, logs: LogEntry[]) => {
    cacheRef.current = { ...cacheRef.current, [key]: logs }
    setCache((prev) => ({ ...prev, [key]: logs }))
  }, [])

  const fetchMonth = useCallback(
    async (year: number, month: number): Promise<LogEntry[]> => {
      const key = toKey(year, month)
      if (cacheRef.current[key]) return cacheRef.current[key]
      const logs = await window.api.readLogs({ year, month })
      updateCache(key, logs)
      return logs
    },
    [updateCache]
  )

  const getLogsForDate = useCallback(
    (dateKey: string): LogEntry[] => {
      const { year, month } = getYearMonth(dateKey)
      const key = toKey(year, month)
      return (cache[key] ?? []).filter((e) => e.date === dateKey)
    },
    [cache]
  )

  const addEntry = useCallback(
    async (entry: LogEntry): Promise<void> => {
      const { year, month } = getYearMonth(entry.date)
      const key = toKey(year, month)
      const existing = await fetchMonth(year, month)
      const updated = [...existing, entry]
      await window.api.writeLogs({ year, month, logs: updated })
      updateCache(key, updated)
    },
    [fetchMonth, updateCache]
  )

  const updateEntry = useCallback(
    async (updated: LogEntry, original?: LogEntry): Promise<void> => {
      const { year: newYear, month: newMonth } = getYearMonth(updated.date)
      const newKey = toKey(newYear, newMonth)

      if (original && original.date !== updated.date) {
        // Cross-month move: remove from old month first
        const { year: oldYear, month: oldMonth } = getYearMonth(original.date)
        const oldKey = toKey(oldYear, oldMonth)
        const oldLogs = await fetchMonth(oldYear, oldMonth)
        const filteredOld = oldLogs.filter((e) => e.id !== original.id)
        await window.api.writeLogs({ year: oldYear, month: oldMonth, logs: filteredOld })
        updateCache(oldKey, filteredOld)

        // Then add to new month
        const newLogs = await fetchMonth(newYear, newMonth)
        const updatedNew = [...newLogs, updated]
        await window.api.writeLogs({ year: newYear, month: newMonth, logs: updatedNew })
        updateCache(newKey, updatedNew)
      } else {
        // Same month
        const logs = await fetchMonth(newYear, newMonth)
        const updatedLogs = logs.map((e) => (e.id === updated.id ? updated : e))
        await window.api.writeLogs({ year: newYear, month: newMonth, logs: updatedLogs })
        updateCache(newKey, updatedLogs)
      }
    },
    [fetchMonth, updateCache]
  )

  const deleteEntry = useCallback(
    async (entry: LogEntry): Promise<void> => {
      const { year, month } = getYearMonth(entry.date)
      const key = toKey(year, month)
      const logs = await fetchMonth(year, month)
      const filtered = logs.filter((e) => e.id !== entry.id)
      await window.api.writeLogs({ year, month, logs: filtered })
      updateCache(key, filtered)
    },
    [fetchMonth, updateCache]
  )

  return { fetchMonth, getLogsForDate, addEntry, updateEntry, deleteEntry }
}
