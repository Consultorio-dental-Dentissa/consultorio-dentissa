import { get, post, patch } from "./api";
import type { CreateUserDto } from "../types/api/request/create-user.dto";
import type { UserResponse } from "../types/api/responses/user.response";

export async function requestGetUsers() : Promise<UserResponse[]> {
    return await get<UserResponse[]>("/users");
}

export async function requestRegisterUser(user: CreateUserDto) : Promise<UserResponse> {
    return await post<UserResponse>("/users", user);
}

export async function requestUpdateStatusUser(id: number, status: boolean): Promise<boolean> {
    return await patch(`/users/status/${id}`, {estado: status});
}