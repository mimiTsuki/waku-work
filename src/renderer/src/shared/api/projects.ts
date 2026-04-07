import type { Result } from 'neverthrow'
import type { Project } from '@shared/projects'
import type { IpcError } from '@shared/result'
import { fromIpcResult } from '@renderer/shared/lib/ipc'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export async function readProjects(): Promise<Result<Project[], IpcError>> {
  return fromIpcResult(await window.api.listProjects())
}

export async function writeProjects(projects: Project[]): Promise<Result<void, IpcError>> {
  return fromIpcResult(await window.api.saveProjects(projects))
}

export function useProjects(): {
  projects: Project[]
  activeProjects: Project[]
  save: (projects: Project[]) => Promise<void>
  loading: boolean
} {
  const queryClient = useQueryClient()

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const result = await readProjects()
      if (result.isErr()) throw new Error(`[${result.error.type}] ${result.error.message}`)
      return result.value
    }
  })

  const activeProjects = projects.filter((p) => !p.archived)

  const mutation = useMutation({
    mutationFn: async (updated: Project[]) => {
      const result = await writeProjects(updated)
      if (result.isErr()) throw new Error(`[${result.error.type}] ${result.error.message}`)
      return updated
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['projects'], updated)
    }
  })

  return {
    projects,
    activeProjects,
    save: (updated) => mutation.mutateAsync(updated).then(() => undefined),
    loading: isLoading
  }
}
