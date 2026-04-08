import type { IpcError } from '@shared/result'
import type { Template } from '@shared/templates'
import type { Result } from 'neverthrow'
import { fetchApi } from './fetch'

export async function readTemplates(): Promise<Result<Template[], IpcError>> {
  return fetchApi<Template[]>('/templates')
}

export async function writeTemplates(templates: Template[]): Promise<Result<void, IpcError>> {
  return fetchApi<void>('/templates', { method: 'PUT', body: JSON.stringify(templates) })
}
