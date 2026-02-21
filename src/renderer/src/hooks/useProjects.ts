import { useState, useEffect, useCallback } from 'react'
import type { Project } from '@renderer/lib/types'

export function useProjects(): {
  projects: Project[]
  activeProjects: Project[]
  save: (projects: Project[]) => Promise<void>
  loading: boolean
} {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.api.readProjects().then((loaded) => {
      setProjects(loaded)
      setLoading(false)
    })
  }, [])

  const activeProjects = projects.filter((p) => !p.archived)

  const save = useCallback(async (updated: Project[]) => {
    await window.api.writeProjects(updated)
    setProjects(updated)
  }, [])

  return { projects, activeProjects, save, loading }
}
