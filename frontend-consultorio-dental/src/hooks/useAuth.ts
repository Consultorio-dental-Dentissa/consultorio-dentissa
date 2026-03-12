import { useState } from "react";
import { iniciar_sesion } from "../services/auth.service";

export function useAuth() {

    const [error, setError] = useState('');

    async function login(credenciales: any) {

        try {

            if (!credenciales.correo || !credenciales.contraseña) {
                setError('Debes llenar todos los campos');
                return;
            }

            const respuesta = await iniciar_sesion(credenciales);
            
            return respuesta;

        } catch (error) {
            setError((error as Error).message);
        }
        
    }


    return { login, error }

}