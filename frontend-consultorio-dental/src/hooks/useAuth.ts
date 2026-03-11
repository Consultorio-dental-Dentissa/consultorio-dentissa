import { useState } from "react";
import { iniciar_sesion } from "../services/auth.service";
import Cookies from 'js-cookie'

export function useAuth() {

    const [error, setError] = useState('');

    async function login(credenciales: any) {

        try {

            if (!credenciales.correo || !credenciales.contraseña) {
                setError('Debes llenar todos los campos');
                return;
            }

            const respuesta = await iniciar_sesion(credenciales);

            Cookies.set('token', respuesta.token, {secure: true});
            
            return respuesta;

        } catch (error) {
            setError((error as Error).message);
        }
        
    }


    return { login, error }

}