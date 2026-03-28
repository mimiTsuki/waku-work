import { useState, useEffect } from 'react'
import { addDays, format } from 'date-fns'
import { getWeekStart, getWeekDays, formatDateKey } from '@renderer/lib/timeUtils'

export function useWeekNavigation(weekStartOnMonday: boolean) {
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date(), weekStartOnMonday))

  useEffect(() => {
    setWeekStart((prev) => getWeekStart(prev, weekStartOnMonday))
  }, [weekStartOnMonday])

  const weekDays = getWeekDays(weekStart)
  const weekDateKeys = weekDays.map(formatDateKey)
  const weekLabel = `${format(weekDays[0], 'yyyy/MM/dd')} 〜 ${format(weekDays[6], 'MM/dd')}`

  const goToPrevWeek = (): void => setWeekStart((prev) => addDays(prev, -7))
  const goToNextWeek = (): void => setWeekStart((prev) => addDays(prev, 7))
  const goToThisWeek = (): void => setWeekStart(getWeekStart(new Date(), weekStartOnMonday))

  return { weekStart, weekDays, weekDateKeys, weekLabel, goToPrevWeek, goToNextWeek, goToThisWeek }
}
