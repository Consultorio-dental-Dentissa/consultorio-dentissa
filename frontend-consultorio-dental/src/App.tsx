import Router from "./router/router";
import { AuthProvider } from "@/features/auth/context/auth-context-provider";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { Toaster } from "react-hot-toast";
import { OfflineBanner } from "@/components/shared/offline-banner.component";
import { ApiError, type ApiErrorCode } from "@/services/api";

const CLIENT_ERROR_CODES: ApiErrorCode[] = [
  "unauthorized", "forbidden", "not_found", "conflict", "validation", "rate_limited",
];

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Los errores del cliente (4xx) son respuestas deliberadas del backend: no se reintentan.
      retry: (failureCount, error) =>
        failureCount < 1 && !(error instanceof ApiError && CLIENT_ERROR_CODES.includes(error.code)),
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Única librería de avisos de la app: react-hot-toast, con el aviso de docs/DISEÑO-FINAL (Notificaciones):
 * abajo a la derecha, 380px, blanco, borde #e5e7eb, radio 12, sombra 0 16px 40px rgba(0,0,0,.14), padding 16x18,
 * título 15px y texto 14px.
 */
function AppToaster() {
  return (
    <Toaster
      position="bottom-right"
      containerStyle={{ right: 28, bottom: 28 }}
      toastOptions={{
        duration: 4000,
        style: {
          background: "var(--surface)",
          color: "var(--foreground)",
          border: "1px solid var(--border)",
          borderRadius: "12px",
          fontWeight: 700,
          boxShadow: "var(--shadow-toast)",
          fontSize: "15px",
          padding: "16px 18px",
          maxWidth: "380px",
        },
        success: { iconTheme: { primary: "var(--success-dot)", secondary: "var(--surface)" } },
        error: { iconTheme: { primary: "var(--danger-dot)", secondary: "var(--surface)" } },
      }}
    />
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppToaster />
      <OfflineBanner />

      <AuthProvider>
        <Router />
      </AuthProvider>

      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

export default App;
