import { requestLogin, requestLogout } from "../services/auth.service";
import { useState } from "react";
import type { ApiError } from "../types/api/responses/api-error";
import type { LoginDto } from "../types/api/request/login.dto";

export function useLogin() {

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);


    const clearError = () => {
        setError(null);
    }

    async function login(credenciales: LoginDto ) {

        setError(null);
        setLoading(true);

        return await requestLogin(credenciales)
            .catch((error: ApiError) => { setError(error.message); throw error.message; })
            .finally(() => setLoading(false));
    }

    async function logout() {
        
        return await requestLogout()
            .catch((error: ApiError) => { setError(error.message); throw error.message })
            .finally(() => setLoading(false));
    }

    return { login, logout, loading, error, clearError }

}