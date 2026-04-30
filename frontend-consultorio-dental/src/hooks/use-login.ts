import { requestLogin, requestLogout } from "../services/auth.service";
import { useState } from "react";
import type { LoginDto } from "../types/api/request/login.dto";
import type { LoginResponse } from "@/types/api/responses/login.response";

export function useLogin() {

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function login(credenciales: LoginDto): Promise<LoginResponse | null> {

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

    async function logout(): Promise<void> {
        
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
        login,
        logout,
        isLoading,
        error
    }

}