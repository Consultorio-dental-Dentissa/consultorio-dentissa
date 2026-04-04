import type { RespuestaUsuario } from '@/types/api/responses/RespuestaUsuario';
import { AuthContext, } from './AuthContext';
import { useState, useContext, type ReactNode, useEffect } from 'react';



interface AuthProviderProps {
    children: ReactNode;
}


export function AuthProvider({ children }: AuthProviderProps) {
    const [usuario, setUsuario] = useState<RespuestaUsuario | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {

        const usuario = JSON.parse(localStorage.getItem('usuario') ?? 'null');

        if (!usuario) {
            setUsuario(null);
            setIsAuthenticated(false);
            return;
        }

        setUsuario(usuario);
        setIsAuthenticated(true);

        setLoading(false);
    }, []);

    
    const iniciarSesion = (usuario: RespuestaUsuario, token: string) => {

        // Autenticamos al usuario y guardamos sus datos
        setIsAuthenticated(true);
        setUsuario(usuario);

        // Guardamos lo datos en el localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('usuario', JSON.stringify(usuario));
        localStorage.setItem('isAuthenticated', 'true');
    };

    
    const cerrarSesion = () => {
        setUsuario(null);
        setIsAuthenticated(false);

        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        localStorage.removeItem('isAuthenticated');
    };

    return (
        <AuthContext.Provider value={{ usuario, isAuthenticated, iniciarSesion, cerrarSesion, loading}}>
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