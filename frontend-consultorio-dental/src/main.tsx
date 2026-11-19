import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

// Nunito Sans variable (ejes wght + opsz), como en docs/DISEÑO-FINAL.
import '@fontsource-variable/nunito-sans/opsz.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <App />
  </StrictMode>
)