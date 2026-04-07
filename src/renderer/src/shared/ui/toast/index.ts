import { ToastProvider } from './Provider'
import { ToastRoot } from './Root'
import { ToastTitle } from './Title'
import { ToastDescription } from './Description'
import { ToastClose } from './Close'
import { ToastViewport } from './Viewport'
import { toastVariants } from './style'

export const Toast = {
  Provider: ToastProvider,
  Root: ToastRoot,
  Title: ToastTitle,
  Description: ToastDescription,
  Close: ToastClose,
  Viewport: ToastViewport,
  variants: toastVariants
}
