import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { updateUser, updateUserStatus, createUser, getAllUsers } from "@/features/users/services/users.service";
import type { CreateUserDto } from "@/features/users/types/create-user.dto";
import type { UpdateUserDto } from "@/features/users/types/update-user.dto";
import type { UserFilters } from "@/features/users/types/user.filters";
import { SESSION_QUERY_KEY } from "@/features/auth/context/auth-context";

export function useUsers(filters?: UserFilters) {
    return useQuery({
        queryKey: ["users", filters],
        queryFn: () => getAllUsers(filters),
        placeholderData: keepPreviousData,
    });
}

export function useCreateUser() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (newUser: CreateUserDto) => createUser(newUser),
        onSuccess: (user) => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            // Un usuario PACIENTE nuevo también aparece en el listado de pacientes
            if (user.role === "PACIENTE") queryClient.invalidateQueries({ queryKey: ["patients"] });
        },
    });
}

export function useUpdateUser(id: number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (dto: UpdateUserDto) => updateUser(id, dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            // Nombre, correo y teléfono también se muestran en pacientes, citas y auditoría
            queryClient.invalidateQueries({ queryKey: ["patients"] });
            queryClient.invalidateQueries({ queryKey: ["appointments"] });
            queryClient.invalidateQueries({ queryKey: ["audit"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });
            // Si el administrador edita su propio perfil, la sesión (/auth/me) debe reflejarlo.
            queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY });
        },
    });
}

export function useUpdateUserStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status }: { id: number; status: boolean }) => updateUserStatus(id, status),
        onSuccess: () => {
            // El estado del usuario también se refleja en pacientes y citas.
            queryClient.invalidateQueries({ queryKey: ["users"] });
            queryClient.invalidateQueries({ queryKey: ["patients"] });
            queryClient.invalidateQueries({ queryKey: ["appointments"] });
            queryClient.invalidateQueries({ queryKey: ["audit"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        },
    });
}
