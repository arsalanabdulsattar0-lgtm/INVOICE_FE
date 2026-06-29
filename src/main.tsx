import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './context/ThemeContext'
import { PermissionProvider } from './context/PermissionContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <PermissionProvider>
        <App />
      </PermissionProvider>
    </ThemeProvider>
  </StrictMode>,
)
