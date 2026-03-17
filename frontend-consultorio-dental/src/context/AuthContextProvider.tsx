import type { Usuario } from '../types/Usuario';
import { AuthContext, } from './AuthContext';
import { useState, useContext, type ReactNode, useEffect } from 'react';



interface AuthProviderProps {
    children: ReactNode;
}


export function AuthProvider({ children }: AuthProviderProps) {
    const [usuario, setUsuario] = useState<Usuario | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

    useEffect(() => {

        const usuario = JSON.parse(localStorage.getItem('usuario') ?? 'null');

        if (!usuario) {
            setUsuario(null);
            setIsAuthenticated(false);
            return;
        }

        setUsuario(usuario);
        setIsAuthenticated(true);

    }, []);

    /*
    const iniciarSesion = (datosUsuario: Usuario, token: string) => {
        setUsuario(datosUsuario);
        setIsAuthenticated(true);
        localStorage.setItem('token', JSON.stringify(token));
    };

    const cerrarSesion = () => {
        setUsuario(null);
        setIsAuthenticated(false);
        localStorage.removeItem('token');
    };
    */

    return (
        <AuthContext.Provider value={{ usuario, setUsuario, isAuthenticated , setIsAuthenticated}}>
            {children}
        </AuthContext.Provider>
    );
}


export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de AuthProvider');
    }
    return context;
}