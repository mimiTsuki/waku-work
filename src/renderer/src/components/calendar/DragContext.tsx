import React, { createContext, useContext, useState, useRef, useCallback } from 'react'
import type { DragState } from '@renderer/lib/types'

interface DragContextValue {
  dragState: DragState
  setDragState: (state: DragState) => void
  dragStateRef: React.MutableRefObject<DragState>
}

const DragContext = createContext<DragContextValue | null>(null)

export function DragProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [dragState, setDragStateRaw] = useState<DragState>({ type: 'idle' })
  const dragStateRef = useRef<DragState>({ type: 'idle' })

  const setDragState = useCallback((state: DragState) => {
    dragStateRef.current = state
    setDragStateRaw(state)
  }, [])

  return (
    <DragContext.Provider value={{ dragState, setDragState, dragStateRef }}>
      {children}
    </DragContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useDragContext(): DragContextValue {
  const ctx = useContext(DragContext)
  if (!ctx) throw new Error('useDragContext must be used within DragProvider')
  return ctx
}
