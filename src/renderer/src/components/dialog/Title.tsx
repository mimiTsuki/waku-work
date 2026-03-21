import { forwardRef, type ComponentRef, type ComponentPropsWithoutRef } from 'react'
import { Title } from '@radix-ui/react-dialog'

import { cn } from '@renderer/lib/utils'

const DialogTitle = forwardRef<ComponentRef<typeof Title>, ComponentPropsWithoutRef<typeof Title>>(
  ({ className, ...props }, ref) => (
    <Title
      ref={ref}
      className={cn('text-lg font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  )
)
DialogTitle.displayName = Title.displayName

export { DialogTitle }
