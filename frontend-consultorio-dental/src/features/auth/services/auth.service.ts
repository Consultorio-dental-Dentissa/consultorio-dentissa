import type { LoginResponse } from "@/features/auth/types/login.response";
import type { UserResponse } from "@/features/users/types/user.response"
import type { User } from "@/features/users/types/user"
import type { CreateUserDto } from "@/features/users/types/create-user.dto";
import type { LoginDto } from "@/features/auth/types/login.dto";
import type { ApiResponse } from "@/types/api.response";

import { deleteR, post } from "@/services/api"
import { userMap } from "@/features/users/types/user.mapper";

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