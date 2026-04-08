import { api } from '@renderer/shared/api'
import { useSuspenseQueries } from '@tanstack/react-query'

export const useLogs = (months: { year: number; month: number }[]) => {
  return useSuspenseQueries({
    queries: months.map(({ year, month }) => ({
      queryKey: ['logs', year, month] as const,
      queryFn: async () => {
        const result = await api.readLogs(year, month)
        if (result.isErr()) throw new Error(`[${result.error.type}] ${result.error.message}`)
        return result.value
      }
    }))
  })
}
