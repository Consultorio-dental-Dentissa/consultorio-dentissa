import type { UserResponse } from "@/features/users/types/user.response";
import type { User } from "@/features/users/types/user.model";

export function userMap(data: UserResponse): User {
    return {
        id: data.id,
        name: data.name,
        lastname: data.lastname,
        email: data.email,
        phone: data.phone,
        status: data.status,
        created_at: new Date(data.created_at),
        role: typeof data.role === "string" ? data.role : data.role.role,
        patient_id: data.patient_id ?? null,
    };
}
