import type { HintItem, HintModeState } from '@renderer/pages/timesheet/model/hintMode'
import React from 'react'

interface HintBadgeProps {
  hint: HintItem
  input: string
}

function HintBadge({ hint, input }: HintBadgeProps): React.JSX.Element {
  const matched = hint.key.startsWith(input)
  const prefix = hint.key.slice(0, input.length)
  const rest = hint.key.slice(input.length)

  return (
    <span
      aria-hidden="true"
      className="absolute z-50 rounded px-1 py-0.5 text-xs font-bold leading-none select-none"
      style={{
        left: hint.x,
        top: hint.y,
        opacity: matched ? 1 : 0.3,
        backgroundColor: '#444',
        color: '#fff'
      }}
    >
      {input.length > 0 && <span style={{ opacity: 0.5 }}>{prefix}</span>}
      {rest}
    </span>
  )
}

interface HintOverlayProps {
  hintState: HintModeState
}

export function HintOverlay({ hintState }: HintOverlayProps): React.JSX.Element | null {
  if (hintState.type !== 'active') return null

  return (
    <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{ zIndex: 40 }}>
      {hintState.hints.map((hint) => (
        <HintBadge key={hint.key} hint={hint} input={hintState.input} />
      ))}
    </div>
  )
}
