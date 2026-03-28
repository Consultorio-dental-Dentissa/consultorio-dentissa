import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider, CssBaseline, createTheme } from '@mui/material'
import App from './App'

const theme = createTheme() // tema por defecto, lo personalizamos después

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* resetea estilos del navegador */}
      <App />
    </ThemeProvider>
  </StrictMode>
)