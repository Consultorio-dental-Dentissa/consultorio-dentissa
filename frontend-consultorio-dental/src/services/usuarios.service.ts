import { get, post, patch } from "./api";
import type { CrearUsuario } from "../types/api//request/CrearUsuario";
import type { RespuestaUsuario } from "../types/api/responses/RespuestaUsuario";

export async function requestUsuarios() : Promise<RespuestaUsuario[]> {
    return await get<RespuestaUsuario[]>("/users");
}

export async function requestRegistrarUsuario(usuario: CrearUsuario) : Promise<RespuestaUsuario> {
    return await post<RespuestaUsuario>("/users", usuario);
}

export async function requestCambiarEstadoUsuario(id: number, estado: boolean): Promise<boolean> {
    return await patch(`/users/status/${id}`, {estado});
}