import { type JSX, type HTMLAttributes } from 'react'

import { cn } from '@renderer/shared/lib/cn'

const DialogHeader = ({ className, ...props }: HTMLAttributes<HTMLDivElement>): JSX.Element => (
  <div className={cn('flex flex-col space-y-4 text-center sm:text-left', className)} {...props} />
)
DialogHeader.displayName = 'DialogHeader'

export { DialogHeader }
