import React, { useState } from 'react'
import { WeekCalendar } from '@renderer/components/calendar/WeekCalendar'
import { LogFormModal } from '@renderer/components/LogFormModal'
import { DeleteConfirmDialog } from '@renderer/components/DeleteConfirmDialog'
import { useLogs } from '@renderer/hooks/useLogs'
import type { LogEntry, Project } from '@renderer/lib/types'

interface LogPageProps {
  projects: Project[]
}

interface ModalState {
  open: boolean
  initial?: {
    date: string
    startTime: string
    endTime: string
    entry?: LogEntry
  }
}

export function LogPage({ projects }: LogPageProps): React.JSX.Element {
  const { fetchMonth, getLogsForDate, addEntry, updateEntry, deleteEntry } = useLogs()
  const [modal, setModal] = useState<ModalState>({ open: false })
  const [deleteTarget, setDeleteTarget] = useState<LogEntry | null>(null)

  const handleCreateRequest = (date: string, startTime: string, endTime: string): void => {
    setModal({ open: true, initial: { date, startTime, endTime } })
  }

  const handleDeleteRequest = (entry: LogEntry): void => {
    setDeleteTarget(entry)
  }

  const handleEditRequest = (entry: LogEntry): void => {
    setModal({
      open: true,
      initial: { date: entry.date, startTime: entry.startTime, endTime: entry.endTime, entry }
    })
  }

  const handleSave = async (entry: LogEntry): Promise<void> => {
    if (modal.initial?.entry) {
      await updateEntry(entry, modal.initial.entry)
    } else {
      await addEntry(entry)
    }
  }

  const handleDeleteConfirm = async (): Promise<void> => {
    if (deleteTarget) {
      await deleteEntry(deleteTarget)
      setDeleteTarget(null)
    }
  }

  const handleUpdateEntry = async (updated: LogEntry, original?: LogEntry): Promise<void> => {
    await updateEntry(updated, original)
  }

  return (
    <div className="h-full flex flex-col">
      <WeekCalendar
        projects={projects}
        fetchMonth={fetchMonth}
        getLogsForDate={getLogsForDate}
        onCreateRequest={handleCreateRequest}
        onDeleteRequest={handleDeleteRequest}
        onEditRequest={handleEditRequest}
        onUpdateEntry={handleUpdateEntry}
      />

      <LogFormModal
        open={modal.open}
        initial={modal.initial}
        projects={projects}
        onSave={handleSave}
        onClose={() => setModal({ open: false })}
      />

      <DeleteConfirmDialog
        open={deleteTarget !== null}
        entry={deleteTarget}
        projects={projects}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
