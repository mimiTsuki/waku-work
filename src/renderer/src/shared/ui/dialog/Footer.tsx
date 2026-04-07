import { type JSX, type HTMLAttributes } from 'react'

import { cn } from '@renderer/shared/lib/cn'

const DialogFooter = ({ className, ...props }: HTMLAttributes<HTMLDivElement>): JSX.Element => (
  <div
    className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)}
    {...props}
  />
)
DialogFooter.displayName = 'DialogFooter'

export { DialogFooter }
