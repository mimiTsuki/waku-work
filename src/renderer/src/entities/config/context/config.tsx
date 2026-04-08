import { Config } from '@shared/config'
import { createContext, useContext } from 'react'

export const ConfigContext = createContext<Config | null>(null)
export const useConfigContext = () => {
  const config = useContext(ConfigContext)
  if (!config) {
    // TODO: エラーメッセージ
    throw new Error('ConfigContext not found')
  }

  return config
}
