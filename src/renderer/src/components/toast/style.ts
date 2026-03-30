import { cva } from 'class-variance-authority'

const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg',
  {
    variants: {
      variant: {
        success: 'bg-success text-success-foreground',
        error: 'bg-error text-error-foreground'
      }
    },
    defaultVariants: {
      variant: 'success'
    }
  }
)

export { toastVariants }
