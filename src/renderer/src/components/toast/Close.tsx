import { forwardRef, type ComponentRef, type ComponentPropsWithoutRef } from 'react'
import { Close } from '@radix-ui/react-toast'
import { X } from 'lucide-react'

import { cn } from '@renderer/lib/utils'

const ToastClose = forwardRef<ComponentRef<typeof Close>, ComponentPropsWithoutRef<typeof Close>>(
  ({ className, ...props }, ref) => (
    <Close
      ref={ref}
      className={cn(
        'absolute right-2 top-2 rounded-md p-1 opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2',
        className
      )}
      {...props}
    >
      <X className="h-4 w-4" />
    </Close>
  )
)
ToastClose.displayName = Close.displayName

export { ToastClose }
