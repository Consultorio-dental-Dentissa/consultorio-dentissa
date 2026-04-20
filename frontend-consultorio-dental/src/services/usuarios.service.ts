import { get, post, patch } from "./api";
import type { CreateUserDto } from "../types/api/request/create-user.dto";
import type { UserResponse } from "../types/api/responses/user.response";

export async function requestUsuarios() : Promise<UserResponse[]> {
    return await get<UserResponse[]>("/users");
}

export async function requestRegistrarUsuario(usuario: CreateUserDto) : Promise<UserResponse> {
    return await post<UserResponse>("/users", usuario);
}

export async function requestCambiarEstadoUsuario(id: number, estado: boolean): Promise<boolean> {
    return await patch(`/users/status/${id}`, {estado});
}