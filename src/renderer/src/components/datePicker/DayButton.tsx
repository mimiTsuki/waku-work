import { cn } from '@renderer/lib/utils'
import { cva } from 'class-variance-authority'

const dayButtonVariants = cva(
  'w-full aspect-square flex items-center justify-center text-sm rounded-md text-button-foreground hover:bg-button-hover transition-colors',
  {
    variants: {
      selected: {
        true: 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground'
      },
      accent: {
        true: 'text-secondary font-semibold'
      },
      outside: {
        true: 'text-muted-foreground opacity-40'
      }
    }
  }
)

interface DayButtonProps {
  day: number
  selected?: boolean
  today?: boolean
  outside?: boolean
  onClick?: () => void
}

export function DayButton({ day, selected, today, outside, onClick }: DayButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(dayButtonVariants({ selected, accent: today && !selected, outside }))}
    >
      {day}
    </button>
  )
}
