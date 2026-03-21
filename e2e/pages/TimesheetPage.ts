import { type Page, expect } from '@playwright/test'
import { CalendarGrid } from './CalendarGrid'
import { LogFormModal } from './LogFormModal'

export class TimesheetPage {
  readonly grid: CalendarGrid
  readonly modal: LogFormModal

  constructor(private page: Page) {
    this.grid = new CalendarGrid(page)
    this.modal = new LogFormModal(page)
  }

  async goto() {
    await this.page.goto('/')
    await expect(this.page).toHaveTitle(/Electron/)
  }

  async expectDayHeadersVisible() {
    await expect(this.page.getByRole('columnheader', { name: /月/ })).toBeVisible()
    await expect(this.page.getByRole('columnheader', { name: /火/ })).toBeVisible()
    await expect(this.page.getByRole('columnheader', { name: /水/ })).toBeVisible()
    await expect(this.page.getByRole('columnheader', { name: /木/ })).toBeVisible()
    await expect(this.page.getByRole('columnheader', { name: /金/ })).toBeVisible()
  }
}
