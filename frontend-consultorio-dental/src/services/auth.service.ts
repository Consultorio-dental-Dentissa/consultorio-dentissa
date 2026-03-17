import type { RespuestaLogin } from "../types/RespuestaLogin";
import type { RespuestaUsuario } from "../types/Respuestas/RespuestaUsuario"
import { post } from "./api"
import type { RegistrarUsuario } from "../types/RegistrarUsuario";

export async function requestLogin(credenciales : any): Promise<RespuestaLogin> {
    return await post<RespuestaLogin>('/auth/iniciar-sesion', credenciales);
}


export async function requestRegister(usuario: RegistrarUsuario) {
    return await post<RespuestaUsuario>('/auth/registrar', usuario);
}