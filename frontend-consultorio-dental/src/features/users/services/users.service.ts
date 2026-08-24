import { get, post, patch } from "@/services/api";
import { userMap } from "@/features/users/types/user.mapper";

import type { User } from "@/features/users/types/user.model";
import type { CreateUserDto } from "@/features/users/types/create-user.dto";
import type { UserResponse } from "@/features/users/types/user.response";
import type { UserFilters } from "@/features/users/types/user.filters";


export async function getAllUsers(filters?: UserFilters): Promise<User[]> {

    const params = new URLSearchParams();

    if (filters?.role && filters.role !== 'TODOS') params.set('role', filters.role);
    if (filters?.status && filters.status !== 'TODOS') params.set('status', filters.status);
    if (filters?.search) params.set('search', filters.search);

    const queryString = params.toString();
    const url = queryString ? `/users?${queryString}` : '/users';

    const response = await get<UserResponse[]>(url);
    const usersResponse = response.data;
    const users = usersResponse.map(user => userMap(user));

    return users;
}

export async function createUser(user: CreateUserDto): Promise<User> {
    const response = await post<UserResponse>("/users", user);
    const userCreated = response.data;

    return userMap(userCreated);
}

export async function updateUserStatus(id: number, status: boolean): Promise<boolean> {
    const response = await patch<boolean>(`/users/status/${id}`, { estado: status });
    return response.data;
}