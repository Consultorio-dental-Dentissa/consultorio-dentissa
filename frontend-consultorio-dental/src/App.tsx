import Router from './router/router'
import { AuthProvider } from '@/features/auth/context/auth-context-provider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast'

const queryClient = new QueryClient()


function App() {

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <Toaster position="top-right" />

        <AuthProvider>
          <Router />
        </AuthProvider>
      </QueryClientProvider>
    </>
  )

}

export default App
