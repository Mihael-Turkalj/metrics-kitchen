import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/shrikhand/400.css'
import '@fontsource/bricolage-grotesque/400.css'
import '@fontsource/bricolage-grotesque/600.css'
import '@fontsource/bricolage-grotesque/800.css'
import '@fontsource/martian-mono/400.css'
import '@fontsource/martian-mono/600.css'
import './styles/kitchen.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
