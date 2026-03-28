import type { RespuestaUsuario } from "./RespuestaUsuario";

export interface RespuestaLogin {
    estado: boolean;
    token: string;
    usuario: RespuestaUsuario
}