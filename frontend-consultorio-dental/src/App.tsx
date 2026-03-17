import Router from './router/router'
import { AuthProvider } from './context/AuthContextProvider'

function App() {

  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  )

}

export default App
