'use client'

import { forwardRef, type ComponentRef, type ComponentPropsWithoutRef } from 'react'
import { ScrollDownButton } from '@radix-ui/react-select'
import { ChevronDown } from 'lucide-react'

import { cn } from '@renderer/lib/utils'

const SelectScrollDownButton = forwardRef<
  ComponentRef<typeof ScrollDownButton>,
  ComponentPropsWithoutRef<typeof ScrollDownButton>
>(({ className, ...props }, ref) => (
  <ScrollDownButton
    ref={ref}
    className={cn('flex cursor-default items-center justify-center py-1', className)}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </ScrollDownButton>
))
SelectScrollDownButton.displayName = ScrollDownButton.displayName

export { SelectScrollDownButton }
