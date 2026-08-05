import { requestLogin, requestLogout } from "@/features/auth/services/auth.service";
import { useState } from "react";
import type { LoginDto } from "@/features/auth/types/login.dto";
import type { LoginResponse } from "@/features/auth/types/login.response";

export function useLogin() {

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function useLoginUser(credenciales: LoginDto): Promise<LoginResponse | null> {

        setError(null);
        setIsLoading(true);

        try {
            const loggedUser = await requestLogin(credenciales);
            return loggedUser;

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            setError(errorMessage);
            return null;

        } finally {
            setIsLoading(false);
        }
    }

    async function useLogoutUser(): Promise<void> {
        
        setError(null);
        setIsLoading(true);
        
        try {
            await requestLogout();

        } catch (error) {
            const message = error instanceof Error ? error.message : 'Error desconocido';
            setError(message);

        } finally {
            setIsLoading(false);
        }
    }

    return {
        useLoginUser,
        useLogoutUser,
        isLoading,
        error
    }

}