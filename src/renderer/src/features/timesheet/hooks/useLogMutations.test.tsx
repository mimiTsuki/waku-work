import { type ReactNode } from 'react'
import { renderHook, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { LogEntry } from '@shared/logs'
import { useLogMutations } from './useLogMutations'

const mockReadLogs = vi.fn()
const mockWriteLogs = vi.fn()

vi.stubGlobal('api', {
  readLogs: mockReadLogs,
  writeLogs: mockWriteLogs
})

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

const baseEntry: LogEntry = {
  id: 'entry-1',
  date: '2026-02-15',
  projectId: 'project-1',
  startTime: '09:00',
  endTime: '10:00',
  description: 'Test entry',
  createdAt: '2026-02-15T09:00:00.000Z'
}

describe('useLogMutations', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    mockWriteLogs.mockResolvedValue({ kind: 'success', data: undefined })
  })

  describe('addEntry', () => {
    it('既存のログに新しいエントリを追加する', async () => {
      const existingEntry: LogEntry = { ...baseEntry, id: 'existing-1' }
      mockReadLogs.mockResolvedValue({ kind: 'success', data: [existingEntry] })

      const { result } = renderHook(() => useLogMutations(), {
        wrapper: createWrapper()
      })

      await act(async () => {
        await result.current.addEntry(baseEntry)
      })

      expect(mockWriteLogs).toHaveBeenCalledWith({
        year: 2026,
        month: 2,
        logs: [existingEntry, baseEntry]
      })
    })

    it('ログが空の場合、エントリ1件のみ書き込む', async () => {
      mockReadLogs.mockResolvedValue({ kind: 'success', data: [] })

      const { result } = renderHook(() => useLogMutations(), {
        wrapper: createWrapper()
      })

      await act(async () => {
        await result.current.addEntry(baseEntry)
      })

      expect(mockWriteLogs).toHaveBeenCalledWith({
        year: 2026,
        month: 2,
        logs: [baseEntry]
      })
    })
  })

  describe('updateEntry', () => {
    it('同月のエントリを更新する（originalなし）', async () => {
      const updatedEntry: LogEntry = { ...baseEntry, description: 'Updated description' }
      mockReadLogs.mockResolvedValue({ kind: 'success', data: [baseEntry] })

      const { result } = renderHook(() => useLogMutations(), {
        wrapper: createWrapper()
      })

      await act(async () => {
        await result.current.updateEntry(updatedEntry)
      })

      expect(mockWriteLogs).toHaveBeenCalledTimes(1)
      expect(mockWriteLogs).toHaveBeenCalledWith({
        year: 2026,
        month: 2,
        logs: [updatedEntry]
      })
    })

    it('同じ日付のまま更新する場合は同月更新として処理する', async () => {
      const updatedEntry: LogEntry = { ...baseEntry, startTime: '10:00', endTime: '11:00' }
      mockReadLogs.mockResolvedValue({ kind: 'success', data: [baseEntry] })

      const { result } = renderHook(() => useLogMutations(), {
        wrapper: createWrapper()
      })

      await act(async () => {
        await result.current.updateEntry(updatedEntry, baseEntry)
      })

      expect(mockWriteLogs).toHaveBeenCalledTimes(1)
      expect(mockWriteLogs).toHaveBeenCalledWith({
        year: 2026,
        month: 2,
        logs: [updatedEntry]
      })
    })

    it('跨月移動: 旧月から削除し新月に追加する', async () => {
      const originalEntry: LogEntry = { ...baseEntry, date: '2026-01-31' }
      const updatedEntry: LogEntry = { ...baseEntry, date: '2026-02-01' }

      mockReadLogs
        .mockResolvedValueOnce({ kind: 'success', data: [originalEntry] }) // 旧月 (January)
        .mockResolvedValueOnce({ kind: 'success', data: [] }) // 新月 (February)

      const { result } = renderHook(() => useLogMutations(), {
        wrapper: createWrapper()
      })

      await act(async () => {
        await result.current.updateEntry(updatedEntry, originalEntry)
      })

      expect(mockWriteLogs).toHaveBeenCalledTimes(2)
      expect(mockWriteLogs).toHaveBeenNthCalledWith(1, {
        year: 2026,
        month: 1,
        logs: []
      })
      expect(mockWriteLogs).toHaveBeenNthCalledWith(2, {
        year: 2026,
        month: 2,
        logs: [updatedEntry]
      })
    })
  })

  describe('deleteEntry', () => {
    it('指定したエントリを削除する', async () => {
      const otherEntry: LogEntry = { ...baseEntry, id: 'entry-2' }
      mockReadLogs.mockResolvedValue({ kind: 'success', data: [baseEntry, otherEntry] })

      const { result } = renderHook(() => useLogMutations(), {
        wrapper: createWrapper()
      })

      await act(async () => {
        await result.current.deleteEntry(baseEntry)
      })

      expect(mockWriteLogs).toHaveBeenCalledWith({
        year: 2026,
        month: 2,
        logs: [otherEntry]
      })
    })

    it('最後のエントリを削除すると空のログを書き込む', async () => {
      mockReadLogs.mockResolvedValue({ kind: 'success', data: [baseEntry] })

      const { result } = renderHook(() => useLogMutations(), {
        wrapper: createWrapper()
      })

      await act(async () => {
        await result.current.deleteEntry(baseEntry)
      })

      expect(mockWriteLogs).toHaveBeenCalledWith({
        year: 2026,
        month: 2,
        logs: []
      })
    })
  })
})
