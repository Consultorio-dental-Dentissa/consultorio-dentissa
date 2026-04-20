import { useState } from "react";
import { requestUpdateStatusUser, requestRegisterUser, requestGetUsers } from "../services/users.service"
import type { CreateUserDto } from "../types/api/request/create-user.dto";
import type { ApiError } from "../types/api/responses/api-error";
import type { UserResponse } from "../types/api/responses/user.response";

export function useUsers() {

    const [loading, setLoading] = useState<boolean>(false);
    const [loadingTable, setLoadingTable] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    async function getUsers(): Promise<UserResponse[]> {

        setError(null);
        setLoadingTable(true)

        return await requestGetUsers()
            .catch((error: ApiError) => {setError(error.message); throw error.message;})
            .finally(() => setLoadingTable(false));
    }

    async function registerUser(user: CreateUserDto): Promise<UserResponse> {

        setError(null);
        setLoading(true);

        return await requestRegisterUser(user)
            .catch((error: ApiError) => {setError(error.message); throw error.message;})
            .finally(() => {setLoading(false)})
    }

    async function updateUserStatus(id: number, status: boolean): Promise<boolean> {
        setError(null);
        
        return await requestUpdateStatusUser(id, status)
            .catch((error: ApiError) => {setError(error.message); throw error.message;})
    }

    return { getUsers, registerUser, updateUserStatus, loading, loadingTable, error }
}