import { forwardRef, type ComponentRef, type ComponentPropsWithoutRef } from 'react'
import { Root } from '@radix-ui/react-label'
import { type VariantProps } from 'class-variance-authority'

import { cn } from '@renderer/shared/lib/cn'
import { labelVariants } from './style'

const Label = forwardRef<
  ComponentRef<typeof Root>,
  ComponentPropsWithoutRef<typeof Root> & VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <Root ref={ref} className={cn(labelVariants(), className)} {...props} />
))
Label.displayName = Root.displayName

export { Label }
