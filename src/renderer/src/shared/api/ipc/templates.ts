import { fromIpcResult } from '@renderer/shared/lib/ipc'
import type { IpcError } from '@shared/result'
import type { Template } from '@shared/templates'
import type { Result } from 'neverthrow'

export async function readTemplates(): Promise<Result<Template[], IpcError>> {
  return fromIpcResult(await window.api.listTemplates())
}

export async function writeTemplates(templates: Template[]): Promise<Result<void, IpcError>> {
  return fromIpcResult(await window.api.saveTemplates(templates))
}
