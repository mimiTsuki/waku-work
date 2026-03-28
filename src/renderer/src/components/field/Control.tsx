import { Slot } from '@radix-ui/react-slot'
import type { FC, PropsWithChildren } from 'react'
import { useFieldContext } from './context'

export type FieldControlProps = {
  id?: string
}

export const Control: FC<PropsWithChildren<FieldControlProps>> = ({
  children,
  id: propsId,
  ...props
}) => {
  const { id: contextId, invalid } = useFieldContext()
  const id = propsId ?? contextId

  return (
    <Slot {...props} id={id} data-invalid={invalid || undefined}>
      {children}
    </Slot>
  )
}
