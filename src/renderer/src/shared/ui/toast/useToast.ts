import { useState } from 'react'

type ToastState = {
  type: 'success' | 'error'
  open: boolean
  title: string
  description: string
}

type ToastParams = {
  title: string
  description: string
}

const defaultState: ToastState = {
  type: 'success',
  open: false,
  title: '',
  description: ''
}

export const useToast = () => {
  const [state, setState] = useState<ToastState>(defaultState)

  const success = (params: ToastParams) => setState({ type: 'success', open: true, ...params })
  const error = (params: ToastParams) => setState({ type: 'error', open: true, ...params })
  const close = () => setState(defaultState)

  return { state, success, error, close }
}
