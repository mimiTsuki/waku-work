import { api } from '@renderer/shared/api'
import { useSuspenseQuery } from '@tanstack/react-query'

export function useProjects() {
  return useSuspenseQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const result = await api.readProjects()
      if (result.isErr()) throw new Error(`[${result.error.type}] ${result.error.message}`)
      return result.value
    }
  })
}
