import { zodResolver } from '@hookform/resolvers/zod'
import { useConfig, useMutationConfig, useSelectFolder } from '@renderer/entities/config'
import { useProjects } from '@renderer/entities/project'
import { useMutationTemplates, useTemplates } from '@renderer/entities/template'
import { IS_ELECTRON } from '@renderer/shared/api'
import { cn } from '@renderer/shared/lib/cn'
import { Button } from '@renderer/shared/ui/button'
import { Field } from '@renderer/shared/ui/field'
import { Input } from '@renderer/shared/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@renderer/shared/ui/select'
import type { Theme } from '@shared/config'
import { themeSchema, themeTypes } from '@shared/config'
import { Template } from '@shared/templates'
import { FC, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { TemplateSection } from './TemplateSection'

type SettingsTab = 'general' | 'templates'

const SUB_NAV_ITEMS: { tab: SettingsTab; label: string }[] = [
  { tab: 'general', label: '一般' },
  { tab: 'templates', label: 'テンプレート' }
]

const THEME_OPTIONS: { value: Theme; label: string }[] = [
  { value: themeTypes.SYSTEM, label: 'システム' },
  { value: themeTypes.LIGHT, label: 'ライト' },
  { value: themeTypes.DARK, label: 'ダーク' }
]

const schema = z.object({
  dataDir: z.string(),
  theme: themeSchema,
  weekStartOnMonday: z.boolean(),
  hourHeight: z
    .number({ message: '40〜300 の整数を入力してください' })
    .int({ message: '40〜300 の整数を入力してください' })
    .min(40, { message: '40〜300 の整数を入力してください' })
    .max(300, { message: '40〜300 の整数を入力してください' })
})

type DraftFormType = z.infer<typeof schema>

export const SettingsPage: FC = () => {
  const { data: config } = useConfig()
  const { data: templates } = useTemplates()
  const { data: projects } = useProjects()
  const { mutateAsync: mutateTemplates } = useMutationTemplates()
  const saveTemplates = (templates: Template[]) => {
    mutateTemplates(templates)
  }

  const [activeTab, setActiveTab] = useState<SettingsTab>('general')
  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<DraftFormType>({
    resolver: zodResolver(schema),
    defaultValues: config
  })

  const { mutate, isPending } = useMutationConfig()
  const { selectFolder } = useSelectFolder()

  const handleSelectFolder = () => {
    selectFolder((folder) => {
      if (folder) setValue('dataDir', folder)
    })
  }

  const onSubmit = handleSubmit((data) => {
    mutate({ ...config, ...data })
  })

  const dataDir = watch('dataDir')

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sub navigation */}
      <nav className="w-40 shrink-0 text-nav-foreground bg-nav dark:bg-background flex flex-col gap-1 py-4 px-3">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-2 mb-1">
          設定
        </p>
        {SUB_NAV_ITEMS.map(({ tab, label }) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'cursor-pointer text-left text-sm w-full px-3 py-2 rounded-lg transition-colors',
              activeTab === tab
                ? 'bg-primary dark:text-primary-foreground dark:bg-primary'
                : 'hover:bg-primary/30'
            )}
          >
            {label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <div className="flex-1 overflow-y-auto py-10 px-6">
        <div className="max-w-2xl w-full mx-auto">
          {activeTab === 'general' && (
            <form onSubmit={onSubmit} className="rounded-2xl border border-transparent bg-card p-6">
              <h2 className="text-lg font-medium mb-6">一般</h2>

              <Field.Root className="mb-6">
                <Field.Label>テーマ</Field.Label>
                <Controller
                  name="theme"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <Field.Control>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                      </Field.Control>
                      <SelectContent>
                        {THEME_OPTIONS.map(({ value, label }) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field.Root>

              <Field.Root className="mb-6">
                <Field.Label>週の始まり</Field.Label>
                <Controller
                  name="weekStartOnMonday"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value === false ? 'sunday' : 'monday'}
                      onValueChange={(v) => field.onChange(v === 'monday')}
                    >
                      <Field.Control>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                      </Field.Control>
                      <SelectContent>
                        <SelectItem value="monday">月曜日</SelectItem>
                        <SelectItem value="sunday">日曜日</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field.Root>

              <Field.Root className="mb-6" invalid={!!errors.hourHeight}>
                <Field.Label>1時間あたりの高さ（px）</Field.Label>
                <Field.Control>
                  <Input className="w-28" {...register('hourHeight', { valueAsNumber: true })} />
                </Field.Control>
                {errors.hourHeight && (
                  <p className="text-sm text-destructive">{errors.hourHeight.message}</p>
                )}
              </Field.Root>

              {IS_ELECTRON && (
                <Field.Root className="mb-6">
                  <Field.Label>データ保存フォルダ</Field.Label>
                  <div className="flex gap-2 items-center">
                    <span className="text-sm text-muted-foreground flex-1 truncate">
                      {dataDir ?? config?.dataDir ?? '未設定'}
                    </span>
                    <Field.Control>
                      <Button variant="outline" size="sm" onClick={handleSelectFolder}>
                        変更
                      </Button>
                    </Field.Control>
                  </div>
                </Field.Root>
              )}

              <div className="flex justify-end mt-6">
                <Button type="submit" disabled={isPending}>
                  保存
                </Button>
              </div>
            </form>
          )}

          {activeTab === 'templates' && (
            <div className="rounded-2xl border border-transparent bg-card p-6">
              <TemplateSection templates={templates} projects={projects} onSave={saveTemplates} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
