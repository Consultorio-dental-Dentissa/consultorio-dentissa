import type { UserResponse } from "@/features/users/types/user.response";
import type { User } from "@/features/users/types/user";

export function userMap(data: UserResponse): User {
    return {
        name: data.name,
        lastname: data.lastname,
        role: data.role.role,
        email: data.email,
        phone: data.phone,
        status: data.status,
        created_at: new Date(data.created_at),
        id: data.id
    }
}