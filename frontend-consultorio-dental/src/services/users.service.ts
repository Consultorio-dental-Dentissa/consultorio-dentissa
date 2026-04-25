import { get, post, patch } from "./api";
import { userMap } from "@/types/mappers/user.mapper";

import type { User } from "@/types/models/user";
import type { CreateUserDto } from "../types/api/request/create-user.dto";
import type { UserResponse } from "../types/api/responses/user.response";

export async function requestGetUsers() : Promise<User[]> {
    const userResponse = await get<UserResponse[]>("/users");
    return userResponse.map(user => userMap(user));
}

export async function requestRegisterUser(user: CreateUserDto) : Promise<User> {
    const userResponse = await post<UserResponse>("/users", user);
    return userMap(userResponse);
}

export async function requestUpdateStatusUser(id: number, status: boolean): Promise<boolean> {
    return await patch(`/users/status/${id}`, {estado: status});
}