import { useConfig } from '@renderer/features/settings/useConfig'

export function useWeekStartOnMonday(): boolean {
  const { config } = useConfig()
  return config?.weekStartOnMonday ?? true
}
