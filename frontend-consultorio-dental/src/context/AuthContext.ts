import { createContext } from 'react';
import type { RespuestaUsuario } from '@/types/api/responses/RespuestaUsuario';


interface AuthContextType {
  usuario: RespuestaUsuario | null;
  isAuthenticated: boolean;
  iniciarSesion(datosUsuario : RespuestaUsuario) : void,
  cerrarSesion() : void,
  loading: boolean
}


//export const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const AuthContext = createContext<AuthContextType | null>(null)