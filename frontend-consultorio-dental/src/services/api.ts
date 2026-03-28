import { ApiError } from "../types/api/responses/ApiError";
import axios from 'axios';



const urlAPi = import.meta.env.VITE_API_URL
const obtenerToken = () => localStorage.getItem('token');
axios.defaults.headers.common['Authorization'] = `Bearer ${obtenerToken()}`;



export async function get<T>(endpoint: string): Promise<T> {
    try {
        const respuesta = await axios.get(`${urlAPi}${endpoint}`);
        return respuesta.data;

    } catch (error) {
        manejarError(error);
    }
}

export async function post<T>(endpoint: string, data: object): Promise<T> {
    try {
        const respuesta = await axios.post(`${urlAPi}${endpoint}`, data);
        return respuesta.data;

    } catch (error) {
        manejarError(error);
    }
}

export async function put<T>() {

}

export async function patch<T>(endpoint: string, data: object): Promise<T> {
    try {
        const respuesta = await axios.patch(`${urlAPi}${endpoint}`, data);
        return respuesta.data;

    } catch (error) {
        manejarError(error);
    }
}

export async function deleteR() {

}




function manejarError(error: unknown): never {
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
