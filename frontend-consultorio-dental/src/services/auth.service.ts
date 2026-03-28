import type { RespuestaLogin } from "../types/api/responses/RespuestaLogin";
import type { RespuestaUsuario } from "../types/api/responses/RespuestaUsuario"
import type { CrearUsuario } from "../types/api/request/CrearUsuario";
import type { IniciarSesion } from "../types/api/request/IniciarSesion";

import { post } from "./api"

export async function requestLogin(credenciales : IniciarSesion): Promise<RespuestaLogin> {
    return await post<RespuestaLogin>('/auth/iniciar-sesion', credenciales);
}

export async function requestRegister(usuario: CrearUsuario) : Promise<RespuestaUsuario> {
    return await post<RespuestaUsuario>('/auth/registrar', usuario);
}