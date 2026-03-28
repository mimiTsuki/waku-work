import { type ComponentProps, forwardRef } from 'react'
import { cva } from 'class-variance-authority'
import { useFieldContext } from './context'

export type FieldLabelProps = ComponentProps<'label'> & {}

export const Label = forwardRef<HTMLLabelElement, FieldLabelProps>(
  ({ className, children, id: propsId, ...props }, ref) => {
    const { id: contextId, invalid } = useFieldContext()
    const id = propsId ?? contextId
    return (
      <label {...props} ref={ref} className={style({ className, invalid })} htmlFor={id}>
        {children}
      </label>
    )
  }
)

Label.displayName = 'Field.Label'

const style = cva('', {
  variants: {
    invalid: {
      true: 'text-destructive'
    }
  }
})
