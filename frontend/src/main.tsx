import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { CookieConsentProvider } from './context/CookieConsentContext'
import { AuthProvider } from './auth/AuthContext.tsx'
import { applyThemePreference, readThemePreference } from './utils/themeCookie'

applyThemePreference(readThemePreference())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <CookieConsentProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </CookieConsentProvider>
    </AuthProvider>
  </StrictMode>,
)
