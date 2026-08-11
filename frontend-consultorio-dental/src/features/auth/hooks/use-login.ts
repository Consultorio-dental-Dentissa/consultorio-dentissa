import { requestLogin, requestLogout } from "@/features/auth/services/auth.service";
import { useMutation } from "@tanstack/react-query";
import type { LoginDto } from "@/features/auth/types/login.dto";


export function useLoginUser() {
    return useMutation({
        mutationFn: (credentials: LoginDto) => requestLogin(credentials),
    });
}

export function useLogoutUser() {
    return useMutation({
        mutationFn: () => requestLogout(),
    });
}