import type { Result } from 'neverthrow'
import type { Project } from '@shared/projects'
import type { IpcError } from '@shared/result'
import { fromIpcResult } from '@renderer/lib/ipcUtils'

export async function readProjects(): Promise<Result<Project[], IpcError>> {
  return fromIpcResult(await window.api.listProjects())
}

export async function writeProjects(projects: Project[]): Promise<Result<void, IpcError>> {
  return fromIpcResult(await window.api.saveProjects(projects))
}
