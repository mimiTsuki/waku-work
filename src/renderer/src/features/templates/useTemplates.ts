import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { readTemplates, writeTemplates } from '@renderer/api'
import type { Template } from '@shared/templates'

export function useTemplates(): {
  templates: Template[]
  save: (templates: Template[]) => Promise<void>
  loading: boolean
} {
  const queryClient = useQueryClient()

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const result = await readTemplates()
      if (result.isErr()) throw new Error(`[${result.error.type}] ${result.error.message}`)
      return result.value
    }
  })

  const mutation = useMutation({
    mutationFn: async (updated: Template[]) => {
      const result = await writeTemplates(updated)
      if (result.isErr()) throw new Error(`[${result.error.type}] ${result.error.message}`)
      return updated
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['templates'], updated)
    }
  })

  return {
    templates,
    save: (updated) => mutation.mutateAsync(updated).then(() => undefined),
    loading: isLoading
  }
}
