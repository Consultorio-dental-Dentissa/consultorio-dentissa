import { useAuth } from "@/features/auth/hooks/use-auth";

/** Destino de "Agendar": el panel de citas si hay sesión; si no, el registro. */
export function useBookingPath() {
    const { user } = useAuth();
    return user ? "/citas" : "/registrate";
}
