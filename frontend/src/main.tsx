import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { CookieConsentProvider } from './context/CookieConsentContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CookieConsentProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </CookieConsentProvider>
  </StrictMode>,
)
