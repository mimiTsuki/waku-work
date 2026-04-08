import { api } from '@renderer/shared/api'
import type { Config } from '@shared/config'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'

export function useConfig() {
  return useSuspenseQuery({
    queryKey: ['config'],
    queryFn: async () => {
      const result = await api.readConfig()
      if (result.isErr()) throw new Error(`[${result.error.type}] ${result.error.message}`)
      return result.value
    }
  })
}

export function useMutationConfig() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (updated: Config) => {
      const result = await api.writeConfig(updated)
      if (result.isErr()) throw new Error(`[${result.error.type}] ${result.error.message}`)
      return updated
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['config'], updated)
    }
  })
}
