import { DragContext } from '@renderer/features/timesheet/context/DragContext'
import type { DragState } from '@renderer/features/timesheet/context/DragContext'
import { useCallback, useRef, useState } from 'react'

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
