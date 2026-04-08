import { api } from '@renderer/shared/api'
import type { Template } from '@shared/templates'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useMutationTemplates() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (updated: Template[]) => {
      const result = await api.writeTemplates(updated)
      if (result.isErr()) throw new Error(`[${result.error.type}] ${result.error.message}`)
      return updated
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['templates'], updated)
    }
  })
}
