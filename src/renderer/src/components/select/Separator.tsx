'use client'

import { forwardRef, type ComponentRef, type ComponentPropsWithoutRef } from 'react'
import { Separator } from '@radix-ui/react-select'

import { cn } from '@renderer/lib/utils'

const SelectSeparator = forwardRef<
  ComponentRef<typeof Separator>,
  ComponentPropsWithoutRef<typeof Separator>
>(({ className, ...props }, ref) => (
  <Separator ref={ref} className={cn('-mx-1 my-1 h-px bg-muted', className)} {...props} />
))
SelectSeparator.displayName = Separator.displayName

export { SelectSeparator }
