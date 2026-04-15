import type { RespuestaLogin } from "../types/api/responses/RespuestaLogin";
import type { RespuestaUsuario } from "../types/api/responses/RespuestaUsuario"
import type { CrearUsuario } from "../types/api/request/CrearUsuario";
import type { IniciarSesion } from "../types/api/request/IniciarSesion";

import { deleteR, post } from "./api"

export async function requestLogin(credenciales : IniciarSesion): Promise<RespuestaLogin> {
    return await post<RespuestaLogin>('/auth/login', credenciales);
}

export async function requestRegister(usuario: CrearUsuario) : Promise<RespuestaUsuario> {
    return await post<RespuestaUsuario>('/auth/register', usuario);
}

export async function requestLogout() {
    return await deleteR('/auth/logout');
}