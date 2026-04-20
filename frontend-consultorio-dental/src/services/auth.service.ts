import type { LoginResponse } from "../types/api/responses/login.response";
import type { UserResponse } from "../types/api/responses/user.response"
import type { CreateUserDto } from "../types/api/request/create-user.dto";
import type { LoginDto } from "../types/api/request/login.dto";

import { deleteR, post } from "./api"

export async function requestLogin(credenciales : LoginDto): Promise<LoginResponse> {
    return await post<LoginResponse>('/auth/login', credenciales);
}

export async function requestRegister(usuario: CreateUserDto) : Promise<UserResponse> {
    return await post<UserResponse>('/auth/register', usuario);
}

export async function requestLogout() {
    return await deleteR('/auth/logout');
}