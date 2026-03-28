import { type ComponentProps, forwardRef, useId } from 'react'
import { Context } from './context'
import { cva } from 'class-variance-authority'

export type FieldRootProps = ComponentProps<'div'> & {
  invalid?: boolean
}

export const Root = forwardRef<HTMLDivElement, FieldRootProps>(
  ({ className, children, invalid = false, ...props }, ref) => {
    const id = useId()
    return (
      <Context.Provider value={{ id, invalid }}>
        <div
          {...props}
          ref={ref}
          className={style({ className })}
          data-invalid={invalid || undefined}
        >
          {children}
        </div>
      </Context.Provider>
    )
  }
)

Root.displayName = 'Field.Root'

const style = cva('flex flex-col gap-y-2')
