import { get, post, patch } from "@/services/api";
import { userMap } from "@/features/users/types/user.mapper";
import { buildQueryString, mapPaginated } from "@/utils/query";

import type { User } from "@/features/users/types/user.model";
import type { UpdateUserDto } from "@/features/users/types/update-user.dto";
import type { CreateUserDto } from "@/features/users/types/create-user.dto";
import type { UserResponse } from "@/features/users/types/user.response";
import type { UserFilters } from "@/features/users/types/user.filters";
import type { Paginated } from "@/types/pagination";

export async function getAllUsers(filters: UserFilters = {}): Promise<Paginated<User>> {
    const query = buildQueryString({
        page: filters.page,
        limit: filters.limit,
        role: filters.role,
        status: filters.status,
        search: filters.search,
    });

    const response = await get<Paginated<UserResponse>>(`/users${query}`);
    return mapPaginated(response.data, userMap);
}

export async function createUser(user: CreateUserDto): Promise<User> {
    const response = await post<UserResponse>("/users", user);
    return userMap(response.data);
}

export async function updateUser(id: number, dto: UpdateUserDto): Promise<User> {
    const response = await patch<UserResponse>(`/users/${id}`, dto);
    return userMap(response.data);
}

export async function updateUserStatus(id: number, status: boolean): Promise<boolean> {
    const response = await patch<boolean>(`/users/status/${id}`, { estado: status });
    return response.data;
}
