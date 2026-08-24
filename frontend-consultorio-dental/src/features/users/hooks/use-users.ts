import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUserStatus, createUser, getAllUsers } from "@/features/users/services/users.service"
import type { CreateUserDto } from "@/features/users/types/create-user.dto";
import type { User } from "@/features/users/types/user.model";
import type { UserFilters } from "@/features/users/types/user.filters";


export function useUsers(filters?: UserFilters) {
    return useQuery({
        queryKey: ['users', filters],
        queryFn: () => getAllUsers(filters)
    });
}

export function useCreateUser() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (newUser: CreateUserDto) => createUser(newUser),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] })
    });
}

export function useUpdateUserStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status }: { id: number, status: boolean }) => updateUserStatus(id, status),
        onSuccess: (success, variables) => {

            /**
             * Update the status of the user status 
             * to avoid making a new GET request to the API
             */

            queryClient.setQueryData<User[]>(['users'], prev => prev?.map(user => (user.id === variables.id) ? {...user, status: variables.status} : user));
        },
    });
}