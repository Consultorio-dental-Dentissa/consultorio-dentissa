import type { CrearUsuario } from '../types/api/request/CrearUsuario';
import { requestRegister } from '../services/auth.service';
import { useState } from 'react';
import type { ApiError } from '../types/api/responses/ApiError';

export function useRegister() {

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);


    const clearError = () => {
        setError(null);
    }

    async function register(usuario : CrearUsuario) {
        
        setError(null);
        setLoading(true);

        return await requestRegister(usuario)
            .catch((error: ApiError) => {setError(error.message); throw error.message;})
            .finally(() => setLoading(false));
    }

    return { register, error, loading, clearError }

}