import { type JSX, type HTMLAttributes } from 'react'

import { cn } from '@renderer/lib/utils'

const DialogHeader = ({ className, ...props }: HTMLAttributes<HTMLDivElement>): JSX.Element => (
  <div className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)} {...props} />
)
DialogHeader.displayName = 'DialogHeader'

export { DialogHeader }
