import { createContext } from "react";
import type { User } from "@/features/users/types/user.model";
import type { LoginDto } from "@/features/auth/types/login.dto";

export interface AuthContextType {
    /** Usuario de la sesión, tomado SIEMPRE de GET /auth/me (nunca de localStorage). */
    user: User | null;
    isAuthenticated: boolean;
    /** true mientras se consulta /auth/me por primera vez. */
    loading: boolean;
    /** Fallo de red/servidor al consultar /auth/me (no es lo mismo que "sin sesión"). */
    isError: boolean;
    errorMessage: string | null;
    /** Vuelve a consultar la sesión tras un fallo. */
    retry(): void;
    login(credentials: LoginDto): Promise<User>;
    logOut(): Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

/** Clave de TanStack Query de la sesión (GET /auth/me). */
export const SESSION_QUERY_KEY = ["auth", "me"] as const;
