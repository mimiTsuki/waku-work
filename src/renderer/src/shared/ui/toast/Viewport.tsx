import { forwardRef, type ComponentRef, type ComponentPropsWithoutRef } from 'react'
import { Viewport } from '@radix-ui/react-toast'

import { cn } from '@renderer/shared/lib/cn'

const ToastViewport = forwardRef<
  ComponentRef<typeof Viewport>,
  ComponentPropsWithoutRef<typeof Viewport>
>(({ className, ...props }, ref) => (
  <Viewport
    ref={ref}
    className={cn(
      'fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:max-w-[420px]',
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = Viewport.displayName

export { ToastViewport }
