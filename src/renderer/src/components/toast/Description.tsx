import { forwardRef, type ComponentRef, type ComponentPropsWithoutRef } from 'react'
import { Description } from '@radix-ui/react-toast'

import { cn } from '@renderer/lib/utils'

const ToastDescription = forwardRef<
  ComponentRef<typeof Description>,
  ComponentPropsWithoutRef<typeof Description>
>(({ className, ...props }, ref) => (
  <Description ref={ref} className={cn('text-sm opacity-90', className)} {...props} />
))
ToastDescription.displayName = Description.displayName

export { ToastDescription }
