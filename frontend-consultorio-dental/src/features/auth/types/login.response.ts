import type { User } from "@/features/users/types/user";

export interface LoginResponse {
    logged: boolean;
    user: User
}