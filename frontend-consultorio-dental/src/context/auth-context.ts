import { createContext } from 'react';
import type { User } from '@/types/models/user';


interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  saveUserData(usuario : User) : void,
  logOut() : void,
  loading: boolean
}


//export const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const AuthContext = createContext<AuthContextType | null>(null)