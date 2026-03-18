import type { RespuestaLogin } from "../types/respuestas/RespuestaLogin";
import type { RespuestaUsuario } from "../types/respuestas/RespuestaUsuario"
import type { RegistrarUsuario } from "../types/RegistrarUsuario";
import type { CredencialesLogin } from "../types/CredencialesLogin";

import { post } from "./api"

export async function requestLogin(credenciales : CredencialesLogin): Promise<RespuestaLogin> {
    return await post<RespuestaLogin>('/auth/iniciar-sesion', credenciales);
}

export async function requestRegister(usuario: RegistrarUsuario) : Promise<RespuestaUsuario> {
    return await post<RespuestaUsuario>('/auth/registrar', usuario);
}