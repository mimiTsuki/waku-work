import { api } from '@renderer/shared/api'
import type { Project } from '@shared/projects'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useMutationProjects() {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: async (updated: Project[]) => {
      const result = await api.writeProjects(updated)
      if (result.isErr()) throw new Error(`[${result.error.type}] ${result.error.message}`)
      return updated
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['projects'], updated)
    }
  })

  return mutation
}
