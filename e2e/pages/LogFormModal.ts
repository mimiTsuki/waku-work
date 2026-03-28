import { type Page, type Locator, expect } from '@playwright/test'

export class LogFormModal {
  readonly dialog: Locator
  readonly startTimeInput: Locator
  readonly endTimeInput: Locator
  readonly descriptionInput: Locator
  readonly projectCombobox: Locator
  readonly saveButton: Locator

  constructor(page: Page) {
    this.dialog = page.getByRole('dialog')
    this.startTimeInput = this.dialog.getByPlaceholder('09:00')
    this.endTimeInput = this.dialog.getByPlaceholder('10:00')
    this.descriptionInput = this.dialog.getByPlaceholder('作業内容など（500文字以内）')
    this.projectCombobox = this.dialog.getByRole('combobox')
    this.saveButton = this.dialog.getByRole('button', { name: '保存' })
  }

  async expectVisible() {
    await expect(this.dialog).toBeVisible()
  }

  async expectHidden() {
    await expect(this.dialog).not.toBeVisible()
  }

  async expectHeading(name: string) {
    await expect(this.dialog.getByRole('heading', { name })).toBeVisible()
  }

  async expectDate(date: string) {
    await expect(this.dialog.getByText(date)).toBeVisible()
  }

  async expectDuration(duration: string) {
    await expect(this.dialog.getByText(`所要時間: ${duration}`)).toBeVisible()
  }

  /** 保存ボタンをクリックしてダイアログが閉じるまで待つ */
  async save() {
    await this.saveButton.click()
    await this.expectHidden()
  }
}
