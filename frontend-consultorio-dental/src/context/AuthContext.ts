import { createContext } from 'react';
import type { Usuario } from '../types/Usuario';


interface AuthContextType {
  usuario: Usuario | null;
  setUsuario(usuario: Usuario) : void,
  isAuthenticated: boolean;
  setIsAuthenticated(estado : boolean) : void,  
}


//export const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const AuthContext = createContext<AuthContextType | null>(null)