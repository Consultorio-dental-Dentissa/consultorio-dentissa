import type { LoginResponse } from "../types/api/responses/login.response";
import type { UserResponse } from "../types/api/responses/user.response"
import type { User } from "@/types/models/user"
import type { CreateUserDto } from "../types/api/request/create-user.dto";
import type { LoginDto } from "../types/api/request/login.dto";

import { deleteR, post } from "./api"
import { userMap } from "@/types/mappers/user.mapper";

export async function requestLogin(credentials : LoginDto): Promise<LoginResponse> {
    return await post<LoginResponse>('/auth/login', credentials);
}

export async function requestRegister(user: CreateUserDto) : Promise<User> {
    const userResponse = await post<UserResponse>('/auth/register', user);
    return userMap(userResponse);
}

export async function requestLogout() {
    return await deleteR('/auth/logout');
}