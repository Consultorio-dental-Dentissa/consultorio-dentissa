import type { RespuestaUsuario } from "./RespuestaUsuario";

export interface RespuestaLogin {
    estado: boolean;
    usuario: RespuestaUsuario
}