import { get, post } from "./api";
import type { Usuario } from "../types/Usuario";
import type { RegistrarUsuario } from "../types/RegistrarUsuario";

export async function requestUsuarios() : Promise<Usuario[]> {
    return await get<Usuario[]>("/usuarios");
}

export async function requestRegistrarUsuario(usuario: RegistrarUsuario) : Promise<Usuario> {
    return await post<Usuario>("/usuarios", usuario);
}