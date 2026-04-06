import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { cn } from '@renderer/shared/lib/cn'

export const Provider = TooltipPrimitive.Provider
export const Root = TooltipPrimitive.Root
export const Trigger = TooltipPrimitive.Trigger

export function Content({
  className,
  sideOffset = 4,
  ...props
}: React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>): React.JSX.Element {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        sideOffset={sideOffset}
        className={cn(
          'z-50 overflow-hidden rounded-md bg-card px-2 py-1 text-xs shadow-md animate-in fade-in-0 zoom-in-95',
          className
        )}
        {...props}
      />
    </TooltipPrimitive.Portal>
  )
}
