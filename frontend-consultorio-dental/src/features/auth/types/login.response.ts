import type { User } from "@/features/users/types/user.model";

export interface LoginResponse {
    logged: boolean;
    user: User
}