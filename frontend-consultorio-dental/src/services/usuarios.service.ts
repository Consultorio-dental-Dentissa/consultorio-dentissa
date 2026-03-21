import { get, post, patch } from "./api";
import type { Usuario } from "../types/Usuario";
import type { RegistrarUsuario } from "../types/RegistrarUsuario";

export async function requestUsuarios() : Promise<Usuario[]> {
    return await get<Usuario[]>("/usuarios");
}

export async function requestRegistrarUsuario(usuario: RegistrarUsuario) : Promise<Usuario> {
    return await post<Usuario>("/usuarios", usuario);
}

export async function requestCambiarEstadoUsuario(id: number, estado: boolean) {
    return await patch(`/usuarios/${id}/estado`, {estado});
}