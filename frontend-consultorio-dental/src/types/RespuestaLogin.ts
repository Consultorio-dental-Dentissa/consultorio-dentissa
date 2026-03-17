import type { Usuario } from "./Usuario";

export interface RespuestaLogin {
    estado: boolean;
    token: string;
    usuario: Usuario
}