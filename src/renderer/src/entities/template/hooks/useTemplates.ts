import { api } from '@renderer/shared/api'
import { useSuspenseQuery } from '@tanstack/react-query'

export function useTemplates() {
  return useSuspenseQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const result = await api.readTemplates()
      if (result.isErr()) throw new Error(`[${result.error.type}] ${result.error.message}`)
      return result.value
    }
  })
}
