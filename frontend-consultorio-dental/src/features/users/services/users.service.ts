import { get, post, patch } from "@/services/api";
import { userMap } from "@/features/users/types/user.mapper";

import type { User } from "@/features/users/types/user.model";
import type { CreateUserDto } from "@/features/users/types/create-user.dto";
import type { UserResponse } from "@/features/users/types/user.response";
import type { ApiResponse } from "@/types/api.response";


export async function getAllUsers(): Promise<User[]> {

    const response = await get<ApiResponse<UserResponse[]>>('/users');
    const usersResponse = response.data;
    const users = usersResponse.map(user => userMap(user));

    return users; 
}

export async function createUser(user: CreateUserDto): Promise<User> {
    const response = await post<ApiResponse<UserResponse>>("/users", user);
    const userCreated = response.data;

    return userMap(userCreated);
}

export async function updateUserStatus(id: number, status: boolean): Promise<boolean> {
    const response = await patch<ApiResponse<boolean>>(`/users/status/${id}`, { estado: status });
    return response.data;
}