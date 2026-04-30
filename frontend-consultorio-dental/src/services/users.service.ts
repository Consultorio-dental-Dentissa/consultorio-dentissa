import { get, post, patch } from "./api";
import { userMap } from "@/types/mappers/user.mapper";

import type { User } from "@/types/models/user";
import type { CreateUserDto } from "../types/api/request/create-user.dto";
import type { UserResponse } from "../types/api/responses/user.response";
import type { ApiResponse } from "@/types/api/responses/api.response";

export async function requestGetUsers(): Promise<User[]> {

    const response = await get<ApiResponse<UserResponse[]>>('/users');
    const usersResponse = response.data;
    const users = usersResponse.map(user => userMap(user));

    return users; 
}

export async function requestRegisterUser(user: CreateUserDto): Promise<User> {
    const response = await post<ApiResponse<UserResponse>>("/users", user);
    const userCreated = response.data;

    return userMap(userCreated);
}

export async function requestUpdateStatusUser(id: number, status: boolean): Promise<boolean> {
    const response = await patch<ApiResponse<boolean>>(`/users/status/${id}`, { estado: status });
    return response.data;
}