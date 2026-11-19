import { useMutation } from "@tanstack/react-query";
import {
    requestChangePassword,
    requestForgotPassword,
    requestResetPassword,
    requestSignUp,
} from "@/features/auth/services/auth.service";
import type { RegisterDto } from "@/features/auth/types/register.dto";
import type { ChangePasswordDto, ResetPasswordDto } from "@/features/auth/types/password.dto";

export function useSignUp() {
    return useMutation({
        mutationFn: (userData: RegisterDto) => requestSignUp(userData),
    });
}

export function useChangePassword() {
    return useMutation({
        mutationFn: (dto: ChangePasswordDto) => requestChangePassword(dto),
    });
}

export function useForgotPassword() {
    return useMutation({
        mutationFn: (email: string) => requestForgotPassword(email),
    });
}

export function useResetPassword() {
    return useMutation({
        mutationFn: (dto: ResetPasswordDto) => requestResetPassword(dto),
    });
}
