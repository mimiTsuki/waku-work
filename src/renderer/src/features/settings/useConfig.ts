import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { readConfig, writeConfig } from '@renderer/api'
import type { Config } from '@shared/config'

export function useConfig(): {
  config: Config | null
  loading: boolean
  save: (updated: Config) => Promise<void>
} {
  const queryClient = useQueryClient()

  const { data: config, isLoading } = useQuery({
    queryKey: ['config'],
    queryFn: async () => {
      const result = await readConfig()
      if (result.isErr()) throw new Error(`[${result.error.type}] ${result.error.message}`)
      return result.value
    }
  })

  const mutation = useMutation({
    mutationFn: async (updated: Config) => {
      const result = await writeConfig(updated)
      if (result.isErr()) throw new Error(`[${result.error.type}] ${result.error.message}`)
      return updated
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['config'], updated)
    }
  })

  return {
    config: config ?? null,
    loading: isLoading,
    save: (updated) => mutation.mutateAsync(updated).then(() => undefined)
  }
}
