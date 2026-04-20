import { createContext } from 'react';
import type { User } from '@/types/models/user';


interface AuthContextType {
  usuario: User | null;
  isAuthenticated: boolean;
  iniciarSesion(usuario : User) : void,
  cerrarSesion() : void,
  loading: boolean
}


//export const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const AuthContext = createContext<AuthContextType | null>(null)