import '@renderer/shared/assets/main.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppQueryProvider } from '@renderer/app/providers/AppQueryProvider'
import App from '@renderer/app/App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppQueryProvider>
      <App />
    </AppQueryProvider>
  </StrictMode>
)
