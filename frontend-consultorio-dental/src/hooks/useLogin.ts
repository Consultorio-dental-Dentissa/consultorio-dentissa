import { requestLogin } from "../services/auth.service";
import { useState } from "react";

export function useLogin() {

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);


    const clearError = () => {
        setError(null);
    }


    async function login(correo: string, contraseña: string) {

        const credenciales = {
            correo: correo,
            contraseña: contraseña
        }

        try {

            setLoading(true);
            const respuesta = await requestLogin(credenciales);
            return respuesta;

        } catch (error) {

            setError((error as Error).message);
            return null;

        } finally {
            setLoading(false);
        }
    }

    return { login, loading, error, clearError }

}