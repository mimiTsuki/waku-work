import type { Page } from '@playwright/test'

/** HOUR_HEIGHT=60 と同じ計算: 時刻文字列 "HH:mm" をグリッド上の Y ピクセル値に変換 */
export function timeToY(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

/**
 * スクロール可能なカレンダーグリッド内の、指定した日列・時刻の
 * ビューポート座標 {x, y} を返す。
 *
 * dayIndex: 0=月, 1=火, ..., 6=日
 * time: "HH:mm" 形式
 */
export async function getTimePosition(
  page: Page,
  dayIndex: number,
  time: string
): Promise<{ x: number; y: number }> {
  const scrollable = page.locator('[data-testid="calendar-scrollable"]')
  const scrollableBox = await scrollable.boundingBox()
  if (!scrollableBox) throw new Error('Scrollable container not found')

  const scrollTop = await scrollable.evaluate((el) => (el as HTMLElement).scrollTop)

  const colInfo = await page.evaluate((idx) => {
    const container = document.querySelector('[data-testid="calendar-scrollable"]')
    if (!container) return null
    const cols = container.querySelectorAll('[data-testid="day-column"]')
    const col = cols[idx] as HTMLElement | undefined
    if (!col) return null
    const rect = col.getBoundingClientRect()
    return { left: rect.left, width: rect.width }
  }, dayIndex)

  if (!colInfo) throw new Error(`Day column ${dayIndex} not found`)

  return {
    x: colInfo.left + colInfo.width / 2,
    y: scrollableBox.y + (timeToY(time) - scrollTop)
  }
}

/**
 * 指定した日列・時刻をクリックする。
 */
export async function clickAtTime(page: Page, dayIndex: number, time: string): Promise<void> {
  const pos = await getTimePosition(page, dayIndex, time)
  await page.mouse.click(pos.x, pos.y)
}
