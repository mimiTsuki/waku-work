import { Config, themeTypes } from '@shared/config'
import { useEffect } from 'react'

export function useTheme(config: Config): void {
  useEffect(() => {
    const root = document.documentElement
    const theme = config?.theme ?? themeTypes.SYSTEM

    if (theme === themeTypes.DARK) {
      root.classList.add('dark')
      return
    }

    if (theme === themeTypes.LIGHT) {
      root.classList.remove('dark')
      return
    }

    // system
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent): void => {
      root.classList.toggle('dark', e.matches)
    }
    root.classList.toggle('dark', mq.matches)
    mq.addEventListener('change', handler)
    return () => {
      mq.removeEventListener('change', handler)
    }
  }, [config.theme])
}
