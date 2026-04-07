import React from 'react'
import { ArchiveIcon, Trash2Icon } from 'lucide-react'
import { Button } from '@renderer/shared/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@renderer/shared/ui/tooltip'
import { COLOR_PRESETS, ColorPreset, colorPresetToCss } from '@renderer/shared/config/colorPresets'
import type { Project } from '@shared/projects'
import { ProjectDeleteConfirmDialog } from './ProjectDeleteConfirmDialog'
import { useProjects } from '@renderer/shared/api/projects'

export function ProjectPage(): React.JSX.Element {
  const { projects, save } = useProjects()
  const [name, setName] = React.useState('')
  const [color, setColor] = React.useState<ColorPreset>(COLOR_PRESETS[0])
  const [deleteTarget, setDeleteTarget] = React.useState<Project | null>(null)

  const handleAdd = async (): Promise<void> => {
    if (!name.trim()) return
    const newProject: Project = {
      id: crypto.randomUUID(),
      name: name.trim(),
      color,
      archived: false
    }
    await save([...projects, newProject])
    setName('')
  }

  const handleArchive = async (id: string): Promise<void> => {
    await save(projects.map((p) => (p.id === id ? { ...p, archived: !p.archived } : p)))
  }

  const handleDelete = async (): Promise<void> => {
    if (!deleteTarget) return
    await save(projects.filter((p) => p.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full py-12 px-6">
        <div className="flex flex-col flex-1 max-w-4xl w-full mx-auto rounded-2xl border border-transparent bg-card p-6 min-h-0">
          {/* Add form */}
          <div className="flex items-center gap-2 mb-6 px-4">
            <input
              className="flex-1 border rounded-lg px-3 py-2 text-sm"
              placeholder="案件名"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.nativeEvent.isComposing && handleAdd()}
            />
            <div className="flex gap-1">
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c}
                  className={`w-6 h-6 rounded-full border-2 ${color === c ? 'border-foreground' : 'border-transparent'}`}
                  style={{ backgroundColor: colorPresetToCss(c) }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
            <Button size="sm" onClick={handleAdd}>
              追加
            </Button>
          </div>

          {/* Project list */}
          <ul className="space-y-2 overflow-y-auto flex-1">
            {[...projects]
              .sort((a, b) => Number(a.archived) - Number(b.archived))
              .map((p) => (
                <li
                  key={p.id}
                  className={`flex items-center gap-3 p-3 ${p.archived ? 'opacity-50' : ''}`}
                >
                  <span
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: colorPresetToCss(p.color) }}
                  />
                  <span className="flex-1 text-sm">{p.name}</span>
                  {p.archived ? (
                    <Button variant="ghost" size="sm" onClick={() => handleArchive(p.id)}>
                      復元
                    </Button>
                  ) : (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hover:text-destructive hover:bg-transparent"
                          onClick={() => handleArchive(p.id)}
                        >
                          <ArchiveIcon className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>アーカイブ</TooltipContent>
                    </Tooltip>
                  )}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:text-destructive hover:bg-transparent"
                        onClick={() => setDeleteTarget(p)}
                      >
                        <Trash2Icon className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>削除</TooltipContent>
                  </Tooltip>
                </li>
              ))}
          </ul>
        </div>
      </div>
      <ProjectDeleteConfirmDialog
        open={deleteTarget !== null}
        project={deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </TooltipProvider>
  )
}
