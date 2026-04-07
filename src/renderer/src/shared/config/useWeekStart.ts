import { useConfig } from '@renderer/shared/config/useConfig'

export function useWeekStartOnMonday(): boolean {
  const { config } = useConfig()
  return config?.weekStartOnMonday ?? true
}
