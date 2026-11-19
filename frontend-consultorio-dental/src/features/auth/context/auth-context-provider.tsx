import { useCallback, useEffect, useMemo, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AuthContext, SESSION_QUERY_KEY, type AuthContextType } from "@/features/auth/context/auth-context";
import { requestLogin, requestLogout, requestMe } from "@/features/auth/services/auth.service";
import { ApiError, SESSION_EXPIRED_EVENT } from "@/services/api";
import type { User } from "@/features/users/types/user.model";
import type { LoginDto } from "@/features/auth/types/login.dto";


async function fetchSessionUser(): Promise<User | null> {
    try {
        return await requestMe();
    } catch (error) {
        // Sin sesión válida no es un error de la app: simplemente no hay usuario.
        if (error instanceof ApiError && error.code === "unauthorized") return null;
        throw error;
    }
}

interface AuthProviderProps {
    children: ReactNode;
}

/**
 * La sesión vive en cookies httpOnly; el rol y los datos del usuario se
 * obtienen de GET /auth/me (fuente de autoridad), nunca de localStorage.
 */
export function AuthProvider({ children }: AuthProviderProps) {
    const queryClient = useQueryClient();

    const sessionQuery = useQuery({
        queryKey: SESSION_QUERY_KEY,
        queryFn: fetchSessionUser,
        retry: false,
        staleTime: 5 * 60 * 1000,
    });

    const clearSession = useCallback(() => {
        // Primero se fija la sesión en null (mantiene vivo el observer de AuthProvider);
        // después se descarta todo lo demás para no filtrar datos entre usuarios.
        queryClient.setQueryData(SESSION_QUERY_KEY, null);
        queryClient.removeQueries({
            predicate: (query) => query.queryKey[0] !== SESSION_QUERY_KEY[0] || query.queryKey[1] !== SESSION_QUERY_KEY[1],
        });
    }, [queryClient]);

    useEffect(() => {
        window.addEventListener(SESSION_EXPIRED_EVENT, clearSession);
        return () => window.removeEventListener(SESSION_EXPIRED_EVENT, clearSession);
    }, [clearSession]);

    const login = useCallback(
        async (credentials: LoginDto) => {
            await requestLogin(credentials);
            const user = await queryClient.fetchQuery({
                queryKey: SESSION_QUERY_KEY,
                queryFn: fetchSessionUser,
                staleTime: 0,
            });

            if (!user) {
                throw new ApiError("No se pudo iniciar la sesión. Inténtalo de nuevo.", "unauthorized");
            }

            return user;
        },
        [queryClient],
    );

    const logOut = useCallback(async () => {
        try {
            await requestLogout();
        } catch {
            // Aunque el servidor falle, la sesión local se cierra de todos modos.
        }
        clearSession();
    }, [clearSession]);

    const user = sessionQuery.data ?? null;
    const { isPending, isError, error, refetch } = sessionQuery;

    const value = useMemo<AuthContextType>(
        () => ({
            user,
            isAuthenticated: user !== null,
            loading: isPending,
            isError: isError && user === null,
            errorMessage: isError ? error.message : null,
            retry: () => void refetch(),
            login,
            logOut,
        }),
        [user, isPending, isError, error, refetch, login, logOut],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
