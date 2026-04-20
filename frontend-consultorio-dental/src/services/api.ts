import { ApiError } from "../types/api/responses/api-error";
import axios from 'axios';

const urlAPi = import.meta.env.VITE_API_URL
const api = axios.create({
    withCredentials: true
})

export async function get<T>(endpoint: string): Promise<T> {
    try {
        const response = await api.get(`${urlAPi}${endpoint}`);
        return response.data;

    } catch (error) {
        handleError(error);
    }
}

export async function post<T>(endpoint: string, data: object): Promise<T> {
    try {
        const response = await api.post(`${urlAPi}${endpoint}`, data);
        return response.data;

    } catch (error) {
        handleError(error);
    }
}

export async function put<T>() {

}

export async function patch<T>(endpoint: string, data: object): Promise<T> {
    try {
        const response = await api.patch(`${urlAPi}${endpoint}`, data);
        return response.data;

    } catch (error) {
        handleError(error);
    }
}

export async function deleteR<T>(endpoint: string): Promise<T> {
    try {
        const response = await api.delete(`${urlAPi}${endpoint}`);
        console.log(response);
        return response.data;

    } catch (error) {
        handleError(error);
    }
}




function handleError(error: unknown): never {
    if (axios.isAxiosError(error)) {
        if (error.response) {
            throw new ApiError(
                {
                    message: error.response.data.message ?? 'Error del servidor',
                    error: error.response.data.error,
                    statusCode: error.response.data.statusCode
                }
            )
        } else if (error.request) {
            throw new ApiError({
                message: 'No se pudó comunicar con el servidor',
                error: 'Internal Server Error',
                statusCode: 500
            })
        }
    }
    throw new ApiError({
        message: 'Error inesperado',
        error: 'Internal Server Error',
        statusCode: 500
    })
}
