import { useConfig } from '@renderer/entities/config'
import { timeToY } from '@renderer/pages/timesheet/model/calendarLayout'
import { minutesToTime } from '@renderer/shared/lib/time'
import type { LogEntry } from '@shared/logs'
import React, { useCallback, useEffect, useReducer } from 'react'

export interface EditHintItem {
  type: 'edit'
  key: string
  entry: LogEntry
  x: number
  y: number
}

export interface CreateHintItem {
  type: 'create'
  key: string
  date: string
  hour: number
  x: number
  y: number
}

export type HintItem = EditHintItem | CreateHintItem

export type HintModeState =
  | { type: 'inactive' }
  | { type: 'active'; mode: 'edit' | 'create'; hints: HintItem[]; input: string }

type Action =
  | { type: 'ACTIVATE_EDIT'; hints: EditHintItem[] }
  | { type: 'ACTIVATE_CREATE'; hints: CreateHintItem[] }
  | { type: 'APPEND_INPUT'; char: string }
  | { type: 'POP_INPUT' }
  | { type: 'DEACTIVATE' }

function reducer(state: HintModeState, action: Action): HintModeState {
  switch (action.type) {
    case 'ACTIVATE_EDIT':
      return { type: 'active', mode: 'edit', hints: action.hints, input: '' }
    case 'ACTIVATE_CREATE':
      return { type: 'active', mode: 'create', hints: action.hints, input: '' }
    case 'APPEND_INPUT':
      if (state.type !== 'active') return state
      return { ...state, input: state.input + action.char }
    case 'POP_INPUT':
      if (state.type !== 'active') return state
      return { ...state, input: state.input.slice(0, -1) }
    case 'DEACTIVATE':
      return { type: 'inactive' }
    default:
      return state
  }
}

const SINGLE_CHARS = ['s', 'a', 'd', 'f', 'j', 'k', 'l']
const TWO_FIRST = ['e', 'w', 'c', 'm', 'p', 'g', 'h']
const TWO_SECOND = [
  's',
  'a',
  'd',
  'f',
  'j',
  'k',
  'l',
  'e',
  'w',
  'c',
  'm',
  'p',
  'g',
  'h',
  'b',
  'i',
  'n',
  'o',
  'q',
  'r',
  't',
  'u',
  'v',
  'x',
  'y',
  'z'
]

function generateHintKeys(n: number): string[] {
  const keys: string[] = []
  for (const ch of SINGLE_CHARS) {
    if (keys.length >= n) break
    keys.push(ch)
  }
  outer: for (const first of TWO_FIRST) {
    for (const second of TWO_SECOND) {
      if (keys.length >= n) break outer
      keys.push(first + second)
    }
  }
  return keys
}

function isDialogOpen(): boolean {
  return document.querySelector('[role="dialog"][data-state="open"]') !== null
}

function isInputFocused(): boolean {
  const el = document.activeElement
  if (!el) return false
  const tag = el.tagName.toLowerCase()
  return (
    tag === 'input' ||
    tag === 'textarea' ||
    tag === 'select' ||
    (el as HTMLElement).isContentEditable
  )
}

interface UseHintModeOptions {
  weekDateKeys: string[]
  allLogs: LogEntry[]
  hourHeight: number
  weekColumnsRef: React.MutableRefObject<(HTMLDivElement | null)[]>
  onEditRequest: (entry: LogEntry) => void
  onCreateRequest: (date: string, startTime: string, endTime: string) => void
}

export function useHintMode({
  weekDateKeys,
  allLogs,
  hourHeight,
  weekColumnsRef,
  onEditRequest,
  onCreateRequest
}: UseHintModeOptions): HintModeState {
  const {
    data: { keyboardShortcuts }
  } = useConfig()

  const [state, dispatch] = useReducer(reducer, { type: 'inactive' })

  const activateEditMode = useCallback(() => {
    const entries = allLogs
      .filter((e) => weekDateKeys.includes(e.date))
      .sort((a, b) => {
        const dateOrder = weekDateKeys.indexOf(a.date) - weekDateKeys.indexOf(b.date)
        if (dateOrder !== 0) return dateOrder
        return a.startTime.localeCompare(b.startTime)
      })

    const keys = generateHintKeys(entries.length)
    const hints: EditHintItem[] = entries.map((entry, i) => {
      const colIndex = weekDateKeys.indexOf(entry.date)
      const col = weekColumnsRef.current[colIndex]
      const x = col ? col.offsetLeft + 4 : 0
      const y = timeToY(entry.startTime, hourHeight)
      return { type: 'edit', key: keys[i], entry, x, y }
    })

    dispatch({ type: 'ACTIVATE_EDIT', hints })
  }, [allLogs, weekDateKeys, hourHeight, weekColumnsRef])

  const activateCreateMode = useCallback(() => {
    const totalSlots = weekDateKeys.length * 24
    const keys = generateHintKeys(totalSlots)
    const hints: CreateHintItem[] = []
    let keyIndex = 0

    for (let colIndex = 0; colIndex < weekDateKeys.length; colIndex++) {
      const col = weekColumnsRef.current[colIndex]
      const x = col ? col.offsetLeft + 4 : 0
      for (let hour = 0; hour < 24; hour++) {
        hints.push({
          type: 'create',
          key: keys[keyIndex++],
          date: weekDateKeys[colIndex],
          hour,
          x,
          y: hour * hourHeight
        })
      }
    }

    dispatch({ type: 'ACTIVATE_CREATE', hints })
  }, [weekDateKeys, hourHeight, weekColumnsRef])

  useEffect(() => {
    if (!keyboardShortcuts) return

    const handleKeyDown = (e: KeyboardEvent): void => {
      if (isDialogOpen() || isInputFocused()) return

      if (state.type === 'inactive') {
        if (e.key === 'f') {
          e.preventDefault()
          activateEditMode()
        } else if (e.key === 'n') {
          e.preventDefault()
          activateCreateMode()
        }
        return
      }

      // active mode
      if (e.key === 'Escape') {
        e.preventDefault()
        dispatch({ type: 'DEACTIVATE' })
        return
      }

      if (e.key === 'Backspace') {
        e.preventDefault()
        dispatch({ type: 'POP_INPUT' })
        return
      }

      if (/^[a-z]$/.test(e.key)) {
        e.preventDefault()
        const newInput = state.input + e.key

        const exactMatch = state.hints.find((h) => h.key === newInput)
        if (exactMatch) {
          dispatch({ type: 'DEACTIVATE' })
          if (exactMatch.type === 'edit') {
            onEditRequest(exactMatch.entry)
          } else {
            const startTime = minutesToTime(exactMatch.hour * 60)
            const endTime = minutesToTime(exactMatch.hour * 60 + 15)
            onCreateRequest(exactMatch.date, startTime, endTime)
          }
          return
        }

        const hasPartialMatch = state.hints.some((h) => h.key.startsWith(newInput))
        if (hasPartialMatch) {
          dispatch({ type: 'APPEND_INPUT', char: e.key })
        } else {
          // no match at all — reset
          dispatch({ type: 'DEACTIVATE' })
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    keyboardShortcuts,
    state,
    activateEditMode,
    activateCreateMode,
    onEditRequest,
    onCreateRequest
  ])

  return state
}
