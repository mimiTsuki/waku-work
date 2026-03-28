import { createContext, useContext } from 'react'

export type FieldContextType = {
  id: string
  invalid: boolean
}

export const Context = createContext<FieldContextType | null>(null)

export const useFieldContext = () => {
  const context = useContext(Context)
  if (!context) {
    throw new Error('useFieldContext must be used within a FieldContext')
  }
  return context
}
