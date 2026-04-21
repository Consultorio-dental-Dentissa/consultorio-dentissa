import type { User } from "@/types/models/user";

export interface LoginResponse {
    logged: boolean;
    user: User
}