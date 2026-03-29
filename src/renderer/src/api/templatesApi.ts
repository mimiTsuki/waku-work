import type { Result } from 'neverthrow'
import type { Template } from '@shared/templates'
import type { IpcError } from '@shared/result'
import { fromIpcResult } from '@renderer/lib/ipcUtils'

export async function readTemplates(): Promise<Result<Template[], IpcError>> {
  return fromIpcResult(await window.api.listTemplates())
}

export async function writeTemplates(templates: Template[]): Promise<Result<void, IpcError>> {
  return fromIpcResult(await window.api.saveTemplates(templates))
}
