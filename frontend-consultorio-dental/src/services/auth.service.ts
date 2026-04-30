import type { LoginResponse } from "../types/api/responses/login.response";
import type { UserResponse } from "../types/api/responses/user.response"
import type { User } from "@/types/models/user"
import type { CreateUserDto } from "../types/api/request/create-user.dto";
import type { LoginDto } from "../types/api/request/login.dto";
import type { ApiResponse } from "@/types/api/responses/api.response";

import { deleteR, post } from "./api"
import { userMap } from "@/types/mappers/user.mapper";

export async function requestLogin(credentials : LoginDto): Promise<LoginResponse> {
    const response =  await post<ApiResponse<LoginResponse>>('/auth/login', credentials);
    const loginResponse = response.data;
    return loginResponse;
}

export async function requestRegister(user: CreateUserDto) : Promise<User> {
    const response = await post<ApiResponse<UserResponse>>('/auth/register', user);
    const userCreated = response.data;
    return userMap(userCreated);
}

export async function requestLogout() {
    const response = await deleteR<ApiResponse<boolean>>('/auth/logout');
    return response.data;
}