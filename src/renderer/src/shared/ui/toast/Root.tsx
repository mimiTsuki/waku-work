import { forwardRef, type ComponentRef, type ComponentPropsWithoutRef } from 'react'
import { Root } from '@radix-ui/react-toast'
import { type VariantProps } from 'class-variance-authority'

import { cn } from '@renderer/shared/lib/cn'
import { toastVariants } from './style'

type ToastRootProps = ComponentPropsWithoutRef<typeof Root> & VariantProps<typeof toastVariants>

const ToastRoot = forwardRef<ComponentRef<typeof Root>, ToastRootProps>(
  ({ className, variant, ...props }, ref) => (
    <Root ref={ref} className={cn(toastVariants({ variant }), className)} {...props} />
  )
)
ToastRoot.displayName = Root.displayName

export { ToastRoot }
