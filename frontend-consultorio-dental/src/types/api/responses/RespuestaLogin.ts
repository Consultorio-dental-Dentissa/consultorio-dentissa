import type { User } from "@/types/models/User";

export interface RespuestaLogin {
    logged: boolean;
    user: User
}