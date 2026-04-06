import { forwardRef, type ComponentRef, type ComponentPropsWithoutRef } from 'react'
import { Description } from '@radix-ui/react-dialog'

import { cn } from '@renderer/shared/lib/cn'

const DialogDescription = forwardRef<
  ComponentRef<typeof Description>,
  ComponentPropsWithoutRef<typeof Description>
>(({ className, ...props }, ref) => (
  <Description ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
))
DialogDescription.displayName = Description.displayName

export { DialogDescription }
