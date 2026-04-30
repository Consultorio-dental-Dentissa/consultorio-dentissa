import type { CreateUserDto } from '../types/api/request/create-user.dto';
import { requestRegister } from '../services/auth.service';
import { useState } from 'react';

export function useRegister() {

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function signIn(user : CreateUserDto) {
        
        setError(null);
        setIsLoading(true);

        try {
            const userRegistered = await requestRegister(user);
            return userRegistered ? true : false;

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            setError(errorMessage);
            return false;

        } finally {
            setIsLoading(false);
        }
    }

    return { signIn, error, isLoading }

}