import { forwardRef, type ComponentRef, type ComponentPropsWithoutRef } from 'react'
import { Title } from '@radix-ui/react-toast'

import { cn } from '@renderer/lib/utils'

const ToastTitle = forwardRef<ComponentRef<typeof Title>, ComponentPropsWithoutRef<typeof Title>>(
  ({ className, ...props }, ref) => (
    <Title ref={ref} className={cn('text-sm font-semibold', className)} {...props} />
  )
)
ToastTitle.displayName = Title.displayName

export { ToastTitle }
