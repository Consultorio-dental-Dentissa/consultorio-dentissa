import { requestSignUp } from '@/features/auth/services/auth.service';
import { useMutation } from '@tanstack/react-query';
import type { CreateUserDto } from '@/features/users/types/create-user.dto';


export function useSignUp () {
    return useMutation({
        mutationFn: (userData: CreateUserDto) => requestSignUp(userData)
    });
}