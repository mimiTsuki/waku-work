import { test, expect } from '@playwright/test'
import { setupMockApi } from '../helpers/mockApi'
import { TimesheetPage } from '../pages/TimesheetPage'

const FIXED_DATE = '2026-02-23T09:00:00'

// 既存の稼働エントリ: 月曜日 10:00〜11:00
const EXISTING_ENTRY = {
  id: 'entry-1',
  date: '2026-02-23',
  projectId: 'proj-1',
  startTime: '10:00',
  endTime: '11:00',
  description: '既存メモ',
  createdAt: '2026-02-23T01:00:00.000Z'
}

test.describe('3. 稼働編集', () => {
  test('3.1 稼働ブロックをクリックして編集モーダルが開き内容を編集できること', async ({ page }) => {
    await page.clock.setFixedTime(FIXED_DATE)
    await setupMockApi(page, { logs: [EXISTING_ENTRY] })

    const ts = new TimesheetPage(page)

    // Step 1: 遷移して既存ブロックが表示されること
    await ts.goto()
    await ts.grid.waitForVisible()

    const mondayCol = ts.grid.dayColumn(0)

    // 月曜日列に稼働ブロック（高さ 60px = 1 時間）が表示されること
    await mondayCol.expectLogBlockVisible()
    await mondayCol.expectLogBlockText('10:00〜11:00')

    // Step 2: ブロックの中央付近をクリックして編集ダイアログを開く
    // LogBlock: top=1000px(10:00), height=100px → ブロック中央 = 1000+50 = 1050px
    await ts.grid.clickLogBlock(0, '10:00')

    // ダイアログ「稼働ログ編集」が開くこと
    await ts.modal.expectVisible()
    await ts.modal.expectHeading('稼働ログ編集')

    // 日付フィールドに 2026/02/23 が入っていること
    await ts.modal.expectDate('2026/02/23')

    // 開始時刻が 10:00 であること
    await expect(ts.modal.startTimeInput).toHaveValue('10:00')

    // 終了時刻が 11:00 であること
    await expect(ts.modal.endTimeInput).toHaveValue('11:00')

    // 所要時間が「1:00」と表示されること
    await ts.modal.expectDuration('1:00')

    // 案件に「開発業務」が選択されていること
    await expect(ts.modal.projectCombobox).toContainText('開発業務')

    // メモ欄に「既存メモ」が表示されていること
    await expect(ts.modal.descriptionInput).toHaveValue('既存メモ')

    // Step 3: 終了時刻を 12:00 に変更し、メモを「更新後メモ」に書き換えて保存
    await ts.modal.endTimeInput.fill('12:00')
    await ts.modal.descriptionInput.fill('更新後メモ')
    await ts.modal.save()

    // Step 4: 月曜日列の稼働ブロックが 10:00〜12:00 に更新されていること
    await mondayCol.expectLogBlockVisible()
    await mondayCol.expectLogBlockText('10:00〜12:00')
  })
})
