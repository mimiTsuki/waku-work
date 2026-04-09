import { useConfig } from '@renderer/entities/config'
import React from 'react'

const HOURS = Array.from({ length: 24 }, (_, i) => i)

export function TimeAxis(): React.JSX.Element {
  const {
    data: { hourHeight }
  } = useConfig()
  return (
    <div className="relative shrink-0 w-14 select-none" style={{ height: 24 * hourHeight }}>
      {HOURS.map((hour) => (
        <div key={hour} className="absolute right-0 left-0" style={{ top: hour * hourHeight }}>
          <span className="absolute right-2 -translate-y-1/2 text-xs text-muted-foreground top-0">
            {String(hour).padStart(2, '0')}:00
          </span>
          {/* 30min tick */}
          <span
            className="absolute right-2 text-[10px] text-muted-foreground/60"
            style={{ top: hourHeight / 2 - 6 }}
          >
            {String(hour).padStart(2, '0')}:30
          </span>
        </div>
      ))}
    </div>
  )
}
