import React, { useState } from 'react'
import type { LogEntry } from '@shared/logs'
import type { Template } from '@shared/templates'
import { WeekCalendar } from './WeekCalendar'
import { DeleteConfirmDialog } from './DeleteConfirmDialog'
import { LogFormModal, ModalInitialState } from './LogFormModal'
import { useLogMutations } from '@renderer/pages/timesheet/api/logMutations'
import { useProjects } from '@renderer/shared/api/projects'
import { useTemplates } from '@renderer/shared/api/templates'

interface ModalState {
  open: boolean
  defaultValues?: ModalInitialState
}

export function TimesheetPage(): React.JSX.Element {
  const { activeProjects: projects } = useProjects()
  const { templates } = useTemplates()
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

  const handleApplyTemplate = async (template: Template, dateKey: string): Promise<void> => {
    for (const entry of template.entries) {
      const logEntry: LogEntry = {
        id: crypto.randomUUID(),
        date: dateKey,
        projectId: entry.projectId,
        startTime: entry.startTime,
        endTime: entry.endTime,
        description: entry.description,
        createdAt: new Date().toISOString()
      }
      await addEntry(logEntry)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <WeekCalendar
        projects={projects}
        templates={templates}
        onCreateRequest={handleCreateRequest}
        onDeleteRequest={handleDeleteRequest}
        onEditRequest={handleEditRequest}
        onUpdateEntry={updateEntry}
        onApplyTemplate={handleApplyTemplate}
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
