import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './contexts/ThemeContext'
import { AppProvider } from './contexts/AppContext'
import { AuthProvider } from '@/auth/context'
import { LanguageProvider } from './contexts/LanguageContext'

createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <ThemeProvider>
      <AppProvider>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </AppProvider>
    </ThemeProvider>
  </AuthProvider>,
)
