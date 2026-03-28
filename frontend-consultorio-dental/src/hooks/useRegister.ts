import type { RegistrarUsuario } from '../types/RegistrarUsuario';
import { requestRegister } from '../services/auth.service';
import { useState } from 'react';
import type { ApiError } from '../types/respuestas/ApiError';

export function useRegister() {

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);


    const clearError = () => {
        setError(null);
    }

    async function register(usuario : RegistrarUsuario) {
        
        setError(null);
        setLoading(true);

        return await requestRegister(usuario)
            .catch((error: ApiError) => {setError(error.message); return null;})
            .finally(() => setLoading(false));
    }

    return { register, error, loading, clearError }

}