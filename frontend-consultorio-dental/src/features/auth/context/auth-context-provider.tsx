import { AuthContext, } from '@/features/auth/context/auth-context';
import { useState, useContext, type ReactNode, useEffect } from 'react';
import { useLogoutUser } from '@/features/auth/hooks/use-login';
import type { User } from '@/features/users/types/user.model';

interface AuthProviderProps {
    children: ReactNode;
}


export function AuthProvider({ children }: AuthProviderProps) {

    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);

    const logoutMutation = useLogoutUser();

    useEffect(() => {

        try {
            const user = JSON.parse(localStorage.getItem('user') ?? 'null');

            if (!user) {
                setUser(null);
                setIsAuthenticated(false);
                return;
            }

            setUser(user);
            setIsAuthenticated(true);

        } catch {
            localStorage.removeItem('user');
            setUser(null);
            setIsAuthenticated(false);

        } finally {
            setLoading(false);

        }

    }, []);


    useEffect(() => {

        const handleSessionExpired = () => {
            setUser(null);
            setIsAuthenticated(false);
            localStorage.removeItem('user');
            localStorage.removeItem('isAuthenticated');
        };

        window.addEventListener('auth:session-expired', handleSessionExpired);

        return () => window.removeEventListener('auth:session-expired', handleSessionExpired);

    }, []);


    const saveUserData = (user: User) => {

        // Autenticamos al usuario y guardamos sus datos
        setIsAuthenticated(true);
        setUser(user);

        // Guardamos lo datos en el localStorage
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('isAuthenticated', 'true');
    };


    const logOut = async () => {

        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
        logoutMutation.mutate();
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, saveUserData, logOut, loading }}>
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