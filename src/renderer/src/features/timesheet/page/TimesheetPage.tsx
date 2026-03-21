import type { LogEntry } from '@shared/logs'
import type { Project } from '@shared/projects'
import React, { useState } from 'react'
import { WeekCalendar } from '../calendar/WeekCalendar'
import { DeleteConfirmDialog } from '../components/DeleteConfirmDialog'
import { LogFormModal, ModalInitialState } from '../components/LogFormModal'
import { useLogMutations } from '../hooks/useLogMutations'

interface TimesheetPageProps {
  projects: Project[]
}

interface ModalState {
  open: boolean
  defaultValues?: ModalInitialState
}

export function TimesheetPage({ projects }: TimesheetPageProps): React.JSX.Element {
  const { addEntry, updateEntry, deleteEntry } = useLogMutations()
  const [modal, setModal] = useState<ModalState>({ open: false })
  const [deleteTarget, setDeleteTarget] = useState<LogEntry | null>(null)

  const handleCreateRequest = (date: string, startTime: string, endTime: string): void => {
    setModal({ open: true, defaultValues: { kind: 'create', date, startTime, endTime } })
  }

  const handleDeleteRequest = (entry: LogEntry): void => {
    setDeleteTarget(entry)
  }

  const handleEditRequest = (entry: LogEntry): void => {
    setModal({ open: true, defaultValues: { kind: 'edit', originalEntry: entry } })
  }

  const handleSave = async (entry: LogEntry): Promise<void> => {
    if (modal.defaultValues?.kind === 'edit') {
      await updateEntry(entry, modal.defaultValues.originalEntry)
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

  return (
    <div className="h-full flex flex-col">
      <WeekCalendar
        projects={projects}
        onCreateRequest={handleCreateRequest}
        onDeleteRequest={handleDeleteRequest}
        onEditRequest={handleEditRequest}
        onUpdateEntry={updateEntry}
      />

      <LogFormModal
        open={modal.open}
        defaultValues={modal.defaultValues}
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
