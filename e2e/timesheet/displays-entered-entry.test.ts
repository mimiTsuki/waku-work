import { test, expect } from '@playwright/test'
import { setupMockApi } from '../helpers/mockApi'
import { TimesheetPage } from '../pages/TimesheetPage'

// テスト実行時の「今日」を月曜日 2026-02-23 に固定する
const FIXED_DATE = '2026-02-23T09:00:00'

test.describe('1. 稼働入力・表示', () => {
  test('1.1 フォームから稼働を入力するとカレンダーに表示されること', async ({ page }) => {
    await page.clock.setFixedTime(FIXED_DATE)
    await setupMockApi(page)

    const ts = new TimesheetPage(page)

    // Step 1: アプリに遷移してカレンダーが表示されること
    await ts.goto()
    await ts.expectDayHeadersVisible()

    // Step 2: 月曜日列（dayIndex=0）の 10:00 付近をクリック
    await ts.grid.clickAt(0, '10:00')

    // ダイアログ「稼働ログ追加」が開くこと
    await ts.modal.expectVisible()
    await ts.modal.expectHeading('稼働ログ追加')

    // 日付フィールドに月曜日（当日 2026/02/23）の日付が入っていること
    await ts.modal.expectDate('2026/02/23')

    // 開始時刻が 10:00 であること
    await expect(ts.modal.startTimeInput).toHaveValue('10:00')

    // 終了時刻が 10:15（クリック時はデフォルト 15 分）であること
    await expect(ts.modal.endTimeInput).toHaveValue('10:15')

    // 所要時間が「0:15」と表示されること
    await ts.modal.expectDuration('0:15')

    // 案件ドロップダウンに「開発業務」が選択されていること
    await expect(ts.modal.projectCombobox).toContainText('開発業務')

    // Step 3: メモ欄に「テスト作業」と入力し「保存」ボタンをクリック
    await ts.modal.memoInput.fill('テスト作業')
    await ts.modal.save()

    // Step 4: 月曜日列に稼働ブロックが表示されること
    await ts.grid.dayColumn(0).expectLogBlockVisible()
  })
})
