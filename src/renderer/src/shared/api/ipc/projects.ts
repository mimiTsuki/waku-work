import { fromIpcResult } from '@renderer/shared/lib/ipc'
import type { Project } from '@shared/projects'
import type { IpcError } from '@shared/result'
import type { Result } from 'neverthrow'

export async function readProjects(): Promise<Result<Project[], IpcError>> {
  return fromIpcResult(await window.api.listProjects())
}

export async function writeProjects(projects: Project[]): Promise<Result<void, IpcError>> {
  return fromIpcResult(await window.api.saveProjects(projects))
}
