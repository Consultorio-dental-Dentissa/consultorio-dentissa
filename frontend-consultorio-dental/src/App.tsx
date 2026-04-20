import Router from './router/router'
import { AuthProvider } from './context/auth-context-provider'
import { Toaster } from 'react-hot-toast'


function App() {

  return (
    <>
      <Toaster position="top-right" />

      <AuthProvider>
        <Router />
      </AuthProvider>
    </>
  )

}

export default App
