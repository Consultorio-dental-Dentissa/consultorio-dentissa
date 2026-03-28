import { get, post, patch } from "./api";
import type { CrearUsuario } from "../types/api//request/CrearUsuario";
import type { RespuestaUsuario } from "../types/api/responses/RespuestaUsuario";

export async function requestUsuarios() : Promise<RespuestaUsuario[]> {
    return await get<RespuestaUsuario[]>("/usuarios");
}

export async function requestRegistrarUsuario(usuario: CrearUsuario) : Promise<RespuestaUsuario> {
    return await post<RespuestaUsuario>("/usuarios", usuario);
}

export async function requestCambiarEstadoUsuario(id: number, estado: boolean): Promise<boolean> {
    return await patch(`/usuarios/${id}/estado`, {estado});
}