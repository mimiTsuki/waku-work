import { createContext, useContext } from 'react'
import type React from 'react'

export type DragState =
  | { type: 'idle' }
  | { type: 'creating'; date: string; startTime: string; currentEndTime: string }
  | { type: 'moving'; entryId: string; date: string; startTime: string; endTime: string }
  | { type: 'resizing'; entryId: string; endTime: string }

export interface DragContextValue {
  dragState: DragState
  setDragState: (state: DragState) => void
  dragStateRef: React.MutableRefObject<DragState>
}

export const DragContext = createContext<DragContextValue | null>(null)

export function useDragContext(): DragContextValue {
  const ctx = useContext(DragContext)
  if (!ctx) throw new Error('useDragContext must be used within DragProvider')
  return ctx
}
