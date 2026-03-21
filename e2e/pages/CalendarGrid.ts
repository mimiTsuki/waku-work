import { type Page, type Locator, expect } from '@playwright/test'
import { getTimePosition, clickAtTime } from '../helpers/calendarCoords'

export class DayColumn {
  readonly logBlock: Locator
  readonly dragPreview: Locator

  constructor(column: Locator) {
    this.logBlock = column.locator('[data-testid="log-block"]').first()
    this.dragPreview = column.locator('[data-testid="drag-preview"]')
  }

  async expectLogBlockVisible() {
    await expect(this.logBlock).toBeVisible()
  }

  async expectLogBlockText(text: string) {
    await expect(this.logBlock).toContainText(text)
  }

  async expectDragPreviewVisible() {
    await expect(this.dragPreview).toBeVisible()
  }
}

export class CalendarGrid {
  readonly scrollable: Locator

  constructor(private page: Page) {
    this.scrollable = page.locator('[data-testid="calendar-scrollable"]')
  }

  dayColumn(index: number): DayColumn {
    return new DayColumn(this.scrollable.locator('[data-testid="day-column"]').nth(index))
  }

  async waitForVisible() {
    await expect(this.scrollable).toBeVisible()
  }

  /** 指定した日列・時刻をクリックして稼働ログ追加ダイアログを開く */
  async clickAt(dayIndex: number, time: string) {
    await clickAtTime(this.page, dayIndex, time)
  }

  /**
   * ドラッグ開始: mousedown して 5px 以上動かしドラッグを検知させる
   * expectDragPreviewVisible() で途中のプレビューを確認したあと moveDragTo() へ進む
   */
  async startDrag(dayIndex: number, startTime: string) {
    const pos = await getTimePosition(this.page, dayIndex, startTime)
    await this.page.mouse.move(pos.x, pos.y)
    await this.page.mouse.down()
    await this.page.mouse.move(pos.x, pos.y + 6, { steps: 1 })
  }

  /** ドラッグ中: 指定時刻まで移動 */
  async moveDragTo(dayIndex: number, endTime: string) {
    const pos = await getTimePosition(this.page, dayIndex, endTime)
    await this.page.mouse.move(pos.x, pos.y, { steps: 10 })
  }

  /** ドラッグ終了: mouseup してダイアログが開く */
  async endDrag() {
    await this.page.mouse.up()
  }

  /**
   * 既存の稼働ブロックをクリックして編集ダイアログを開く
   * blockHeightPx: ブロックの高さ (デフォルト 60px = 1 時間分)、中央を狙う
   */
  async clickLogBlock(dayIndex: number, startTime: string, blockHeightPx = 60) {
    const pos = await getTimePosition(this.page, dayIndex, startTime)
    await this.page.mouse.click(pos.x, pos.y + blockHeightPx / 2)
  }
}
