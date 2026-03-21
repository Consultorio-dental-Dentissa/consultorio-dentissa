import { createContext } from 'react';
import type { Usuario } from '../types/Usuario';


interface AuthContextType {
  usuario: Usuario | null;
  isAuthenticated: boolean;
  iniciarSesion(datosUsuario : Usuario, token : string) : void,
  cerrarSesion() : void,
  loading: boolean
}


//export const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const AuthContext = createContext<AuthContextType | null>(null)