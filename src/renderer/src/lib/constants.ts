export const COLOR_PRESETS = [
  'red',
  'apricot',
  'orange',
  'amber',
  'yellow',
  'lime',
  'emerald',
  'cyan',
  'sky',
  'cerulean',
  'iris',
  'violet',
  'orchid',
  'pink'
] as const

export type ColorPreset = (typeof COLOR_PRESETS)[number]

export function colorPresetToCss(color: string = 'neutral'): string {
  return `light-dark(var(--color-${color}-300), var(--color-${color}-700))`
}
