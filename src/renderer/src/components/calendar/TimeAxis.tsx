import React from 'react'
import { HOUR_HEIGHT } from '@renderer/lib/constants'

const HOURS = Array.from({ length: 24 }, (_, i) => i)

export function TimeAxis(): React.JSX.Element {
  return (
    <div className="relative shrink-0 w-14 select-none" style={{ height: 24 * HOUR_HEIGHT }}>
      {HOURS.map((hour) => (
        <div key={hour} className="absolute right-0 left-0" style={{ top: hour * HOUR_HEIGHT }}>
          <span className="absolute right-2 -translate-y-1/2 text-xs text-gray-400 top-0">
            {String(hour).padStart(2, '0')}:00
          </span>
          {/* 30min tick */}
          <span
            className="absolute right-2 text-[10px] text-gray-300"
            style={{ top: HOUR_HEIGHT / 2 - 6 }}
          >
            {String(hour).padStart(2, '0')}:30
          </span>
        </div>
      ))}
    </div>
  )
}
