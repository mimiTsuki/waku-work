import type { Result } from 'neverthrow'
import type { Template } from '@shared/templates'
import type { IpcError } from '@shared/result'
import { fromIpcResult } from '@renderer/shared/lib/ipc'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export async function readTemplates(): Promise<Result<Template[], IpcError>> {
  return fromIpcResult(await window.api.listTemplates())
}

export async function writeTemplates(templates: Template[]): Promise<Result<void, IpcError>> {
  return fromIpcResult(await window.api.saveTemplates(templates))
}

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
