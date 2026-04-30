import { useState } from "react";
import { requestUpdateStatusUser, requestRegisterUser, requestGetUsers } from "../services/users.service"

import type { CreateUserDto } from "../types/api/request/create-user.dto";
import type { User } from "@/types/models/user"

export function useUsers() {

    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    async function getUsers() {

        setError(null);
        setIsLoading(true);

        try {
            const users = await requestGetUsers();
            setUsers(users);

        } catch(error) {
            const message = error instanceof Error ? error.message : 'Error desconocido';
            setError(message);

        } finally { setIsLoading(false) }
    }

    async function registerUser(user: CreateUserDto): Promise<User | null> {

        setError(null);
        setIsLoading(true);

        try {
            const createdUser = await requestRegisterUser(user);
            setUsers(prev => [...prev, createdUser]);

            return createdUser;

        } catch (error) {
            const message = error instanceof Error ? error.message : 'Error desconocido';
            setError(message);

            return null;

        } finally { setIsLoading(false);}
    }

    async function updateUserStatus(id: number, status: boolean): Promise<boolean> {

        setError(null);
        setIsLoading(true);

        try {
            const isStatusUpdated = await requestUpdateStatusUser(id, status);
            if (isStatusUpdated) {
                setUsers(prev => prev.map(user => user.id === id ? {...user, status} : user));
            }
            return isStatusUpdated;

        } catch (error) {
            const message = error instanceof Error ? error.message : 'Error desconocido';
            setError(message);

            return false;
        } finally { setIsLoading(false) }
    }

    return { 
        users, 
        getUsers, 
        registerUser, 
        updateUserStatus, 
        isLoading, 
        error 
    }
}