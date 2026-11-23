import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { initPwa } from './utils/pwa'

// Nunito Sans variable (ejes wght + opsz), como en docs/DISEÑO-FINAL.
import '@fontsource-variable/nunito-sans/opsz.css';

// Captura el evento de instalación lo antes posible y registra el service worker (solo en producción).
initPwa()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <App />
  </StrictMode>
)