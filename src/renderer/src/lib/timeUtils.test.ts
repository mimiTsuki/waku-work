import { describe, it, expect } from 'vitest'
import { getMonthsInRange } from './timeUtils'

describe('getMonthsInRange', () => {
  it('同じ月内の範囲は1件返す', () => {
    expect(getMonthsInRange('2026-03-01', '2026-03-31')).toEqual([{ year: 2026, month: 3 }])
  })

  it('月またぎの範囲は2件返す', () => {
    expect(getMonthsInRange('2026-03-28', '2026-04-03')).toEqual([
      { year: 2026, month: 3 },
      { year: 2026, month: 4 }
    ])
  })

  it('年またぎの範囲を正しく処理する', () => {
    expect(getMonthsInRange('2025-12-29', '2026-01-04')).toEqual([
      { year: 2025, month: 12 },
      { year: 2026, month: 1 }
    ])
  })

  it('3ヶ月にまたがる範囲を正しく処理する', () => {
    expect(getMonthsInRange('2026-01-01', '2026-03-31')).toEqual([
      { year: 2026, month: 1 },
      { year: 2026, month: 2 },
      { year: 2026, month: 3 }
    ])
  })

  it('同じ日（単日）は1件返す', () => {
    expect(getMonthsInRange('2026-06-15', '2026-06-15')).toEqual([{ year: 2026, month: 6 }])
  })
})
