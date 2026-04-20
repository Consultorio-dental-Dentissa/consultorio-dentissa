import type { UserResponse } from "../api/responses/user.response";
import type { User } from "../models/user";

export function userMap(data: UserResponse): User {
    return {
        name: data.name,
        lastname: data.lastname,
        rol: data.rol.rol,
        email: data.email,
        phone: data.phone,
        status: data.status,
        id: data.id
    }
}