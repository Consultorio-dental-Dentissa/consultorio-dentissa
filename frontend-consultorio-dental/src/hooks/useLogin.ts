import { requestLogin } from "../services/auth.service";
import { useState } from "react";
import type { ApiError } from "../types/respuestas/ApiError";
import type { CredencialesLogin } from "../types/CredencialesLogin";

export function useLogin() {

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);


    const clearError = () => {
        setError(null);
    }

    async function login(credenciales: CredencialesLogin ) {

        setError(null);
        setLoading(true);

        return await requestLogin(credenciales)
            .catch((error: ApiError) => { setError(error.message); return null; })
            .finally(() => setLoading(false));
    }

    return { login, loading, error, clearError }

}