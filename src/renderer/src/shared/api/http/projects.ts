import type { Project } from '@shared/projects'
import type { IpcError } from '@shared/result'
import type { Result } from 'neverthrow'
import { fetchApi } from './fetch'

export async function readProjects(): Promise<Result<Project[], IpcError>> {
  return fetchApi<Project[]>('/projects')
}

export async function writeProjects(projects: Project[]): Promise<Result<void, IpcError>> {
  return fetchApi<void>('/projects', { method: 'PUT', body: JSON.stringify(projects) })
}
