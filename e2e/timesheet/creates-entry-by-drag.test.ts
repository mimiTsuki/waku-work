import { test, expect } from '@playwright/test'
import { setupMockApi } from '../helpers/mockApi'
import { TimesheetPage } from '../pages/TimesheetPage'

const FIXED_DATE = '2026-02-23T09:00:00'

test.describe('2. DnD による稼働入力', () => {
  test('2.1 カレンダー上でドラッグして稼働を作成できること', async ({ page }) => {
    await page.clock.setFixedTime(FIXED_DATE)
    await setupMockApi(page)

    const ts = new TimesheetPage(page)

    // Step 1: 遷移してカレンダーが表示されること
    await ts.goto()
    await ts.grid.waitForVisible()

    const tuesdayCol = ts.grid.dayColumn(1)

    // Step 2: 火曜日列（dayIndex=1）の 13:00 → 14:00 へドラッグ
    await ts.grid.startDrag(1, '13:00')

    // ドラッグ中にプレビューブロック（pointer-events-none）が表示されること
    await tuesdayCol.expectDragPreviewVisible()

    // 14:00 まで移動してマウスを離す
    await ts.grid.moveDragTo(1, '14:00')
    await ts.grid.endDrag()

    // Step 3: mouseup 後にダイアログが開くこと
    await ts.modal.expectVisible()
    await ts.modal.expectHeading('稼働ログ追加')

    // 日付フィールドに火曜日（2026/02/24）が入っていること
    await ts.modal.expectDate('2026/02/24')

    // 開始時刻が 13:00 であること
    await expect(ts.modal.startTimeInput).toHaveValue('13:00')

    // 終了時刻が 14:00 であること
    await expect(ts.modal.endTimeInput).toHaveValue('14:00')

    // 所要時間が「1:00」と表示されること
    await ts.modal.expectDuration('1:00')

    // Step 4: 案件が「開発業務」であること確認後、メモを入力して保存
    await expect(ts.modal.projectCombobox).toContainText('開発業務')
    await ts.modal.descriptionInput.fill('DnD入力テスト')
    await ts.modal.save()

    // Step 5: 火曜日列に稼働ブロックが表示されること（60px 高 → 時刻テキストも表示）
    await tuesdayCol.expectLogBlockVisible()
    await tuesdayCol.expectLogBlockText('13:00〜14:00')
  })
})
