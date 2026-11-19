import type { LoginResponse } from "@/features/auth/types/login.response";
import type { UserResponse } from "@/features/users/types/user.response";
import type { User } from "@/features/users/types/user.model";
import type { LoginDto } from "@/features/auth/types/login.dto";
import type { RegisterDto } from "@/features/auth/types/register.dto";
import type { ChangePasswordDto, ResetPasswordDto } from "@/features/auth/types/password.dto";

import { deleteR, get, patch, post } from "@/services/api";
import { userMap } from "@/features/users/types/user.mapper";

export async function requestLogin(credentials: LoginDto): Promise<boolean> {
    const response = await post<LoginResponse>("/auth/login", credentials);
    return response.data.logged;
}

/** Usuario de la sesión actual. Lanza ApiError('unauthorized') si no hay sesión. */
export async function requestMe(): Promise<User> {
    const response = await get<UserResponse>("/auth/me");
    return userMap(response.data);
}

export async function requestSignUp(user: RegisterDto): Promise<User> {
    const response = await post<UserResponse>("/auth/register", user);
    return userMap(response.data);
}

export async function requestLogout() {
    const response = await deleteR<unknown>("/auth/logout");
    return response.data;
}

export async function requestChangePassword(dto: ChangePasswordDto) {
    const response = await patch<unknown>("/auth/password", dto);
    return response.data;
}

export async function requestForgotPassword(email: string) {
    const response = await post<unknown>("/auth/forgot-password", { email });
    return response.data;
}

export async function requestResetPassword(dto: ResetPasswordDto) {
    const response = await post<unknown>("/auth/reset-password", dto);
    return response.data;
}
