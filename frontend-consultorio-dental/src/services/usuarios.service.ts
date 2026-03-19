import { get } from "./api";
import type { Usuario } from "../types/Usuario";

export async function requestUsuarios() : Promise<Usuario[]> {
    return await get<Usuario[]>("/usuarios");
}