import React from 'react'
import { Button } from '@renderer/components/shadcn/button'
import { COLOR_PRESETS } from '@renderer/lib/constants'
import type { Project } from '@renderer/lib/types'

interface ProjectPageProps {
  projects: Project[]
  onSave: (projects: Project[]) => Promise<void>
}

export function ProjectPage({ projects, onSave }: ProjectPageProps): React.JSX.Element {
  const [name, setName] = React.useState('')
  const [color, setColor] = React.useState(COLOR_PRESETS[0])

  const handleAdd = async (): Promise<void> => {
    if (!name.trim()) return
    const newProject: Project = {
      id: crypto.randomUUID(),
      name: name.trim(),
      color,
      archived: false
    }
    await onSave([...projects, newProject])
    setName('')
  }

  const handleArchive = async (id: string): Promise<void> => {
    await onSave(projects.map((p) => (p.id === id ? { ...p, archived: !p.archived } : p)))
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-lg font-semibold mb-4">案件管理</h2>

      {/* Add form */}
      <div className="flex gap-2 mb-6">
        <input
          className="flex-1 border rounded px-3 py-1.5 text-sm"
          placeholder="案件名"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.nativeEvent.isComposing && handleAdd()}
        />
        <div className="flex gap-1">
          {COLOR_PRESETS.map((c) => (
            <button
              key={c}
              className={`w-6 h-6 rounded-full border-2 ${color === c ? 'border-gray-700' : 'border-transparent'}`}
              style={{ backgroundColor: c }}
              onClick={() => setColor(c)}
            />
          ))}
        </div>
        <Button size="sm" onClick={handleAdd}>
          追加
        </Button>
      </div>

      {/* Project list */}
      <ul className="space-y-2">
        {projects.map((p) => (
          <li
            key={p.id}
            className={`flex items-center gap-3 p-3 rounded border ${p.archived ? 'opacity-50' : ''}`}
          >
            <span className="w-4 h-4 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="flex-1 text-sm">{p.name}</span>
            <Button variant="ghost" size="sm" onClick={() => handleArchive(p.id)}>
              {p.archived ? '復元' : 'アーカイブ'}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  )
}
