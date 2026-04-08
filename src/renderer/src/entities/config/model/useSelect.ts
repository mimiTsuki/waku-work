import { api } from '@renderer/shared/api'

export const useSelectFolder = () => {
  const selectFolder = async (onSelect: (path: string | null) => void) => {
    const folder = await api.selectFolder()
    onSelect(folder)
  }
  return { selectFolder }
}
