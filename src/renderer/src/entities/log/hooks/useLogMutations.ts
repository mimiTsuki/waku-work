import { api } from '@renderer/shared/api'
import { getYearMonth } from '@renderer/shared/lib/time'
import type { LogEntry } from '@shared/logs'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useLogMutations(): {
  addEntry: (entry: LogEntry) => Promise<void>
  updateEntry: (updated: LogEntry, original?: LogEntry) => Promise<void>
  deleteEntry: (entry: LogEntry) => Promise<void>
} {
  const queryClient = useQueryClient()

  const ensureLogs = (year: number, month: number): Promise<LogEntry[]> =>
    queryClient.ensureQueryData({
      queryKey: ['logs', year, month],
      queryFn: async () => {
        const result = await api.readLogs(year, month)
        if (result.isErr()) throw new Error(`[${result.error.type}] ${result.error.message}`)
        return result.value
      }
    })

  const addMutation = useMutation({
    mutationFn: async (entry: LogEntry) => {
      const { year, month } = getYearMonth(entry.date)
      const existing = await ensureLogs(year, month)
      const updated = [...existing, entry]
      const result = await api.writeLogs(year, month, updated)
      if (result.isErr()) throw new Error(`[${result.error.type}] ${result.error.message}`)
      return { year, month, logs: updated }
    },
    onSuccess: ({ year, month, logs }) => {
      queryClient.setQueryData(['logs', year, month], logs)
    }
  })

  const updateMutation = useMutation({
    mutationFn: async ({ updated, original }: { updated: LogEntry; original?: LogEntry }) => {
      const { year: newYear, month: newMonth } = getYearMonth(updated.date)

      if (original && original.date !== updated.date) {
        // Cross-month move: delegate to atomic usecase
        const { year: oldYear, month: oldMonth } = getYearMonth(original.date)
        const result = await api.moveLogEntry(
          original.id,
          oldYear,
          oldMonth,
          newYear,
          newMonth,
          updated
        )
        if (result.isErr()) throw new Error(`[${result.error.type}] ${result.error.message}`)
        return {
          type: 'move' as const,
          oldYear,
          oldMonth,
          newYear,
          newMonth,
          entryId: original.id,
          entry: updated
        }
      } else {
        // Same month update
        const logs = await ensureLogs(newYear, newMonth)
        const updatedLogs = logs.map((e) => (e.id === updated.id ? updated : e))
        const result = await api.writeLogs(newYear, newMonth, updatedLogs)
        if (result.isErr()) throw new Error(`[${result.error.type}] ${result.error.message}`)
        return { type: 'update' as const, year: newYear, month: newMonth, logs: updatedLogs }
      }
    },
    onSuccess: (result) => {
      if (result.type === 'move') {
        queryClient.setQueryData(
          ['logs', result.oldYear, result.oldMonth],
          (prev: LogEntry[] | undefined) => prev?.filter((e) => e.id !== result.entryId)
        )
        queryClient.setQueryData(
          ['logs', result.newYear, result.newMonth],
          (prev: LogEntry[] | undefined) => (prev != null ? [...prev, result.entry] : undefined)
        )
      } else {
        queryClient.setQueryData(['logs', result.year, result.month], result.logs)
      }
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (entry: LogEntry) => {
      const { year, month } = getYearMonth(entry.date)
      const logs = await ensureLogs(year, month)
      const filtered = logs.filter((e) => e.id !== entry.id)
      const result = await api.writeLogs(year, month, filtered)
      if (result.isErr()) throw new Error(`[${result.error.type}] ${result.error.message}`)
      return { year, month, logs: filtered }
    },
    onSuccess: ({ year, month, logs }) => {
      queryClient.setQueryData(['logs', year, month], logs)
    }
  })

  return {
    addEntry: (entry: LogEntry) => addMutation.mutateAsync(entry).then(() => undefined),
    updateEntry: (updated: LogEntry, original?: LogEntry) =>
      updateMutation.mutateAsync({ updated, original }).then(() => undefined),
    deleteEntry: (entry: LogEntry) => deleteMutation.mutateAsync(entry).then(() => undefined)
  }
}
