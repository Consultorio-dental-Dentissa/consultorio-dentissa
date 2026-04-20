import type { UserResponse } from "../api/responses/user.response";
import type { User } from "../models/user";

export function userMap(data: UserResponse): User {
    return {
        name: data.name,
        lastname: data.lastname,
        role: data.role.role,
        email: data.email,
        phone: data.phone,
        status: data.status,
        id: data.id
    }
}