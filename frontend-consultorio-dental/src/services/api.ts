import type { ApiResponse } from '@/types/api/responses/api.response';
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true
});

api.interceptors.response.use(
    (response) => {

        /**
         * Dejamos esto preparado para cuando se implemente
         * el interceptor de respuestas del backend
         */
        if (response.data.success && response.data.data) {
            const apiResponse: ApiResponse<any> = response.data;
            console.log("Standar response: ", apiResponse);

            return apiResponse.data;
        }

        /**
         * Por ahora solo retornamos la data resultante sin el formato
         * de ApiResponse hasta agregar el interceptor de respuestas 
         * en el backend. 
         */
        console.log("Not a standar response: ", response.data);
        return response.data
    },
    (error) => {

        if (!axios.isAxiosError(error)) {
            console.log("Error no esperado");

            throw new Error('Error desconocido');
        }

        if (error.response?.data.message) {
            if (error.response?.data.message) {
                /**
                 * Dejamos el manejo de errores del backend 
                 * temporalmente de esta forma hasta implementar
                 * un contrato de respuestas con los errores 
                 * de la api en el futuro.
                 * 
                 * Por ahora el backend seguirá mandando errores
                 * con el formato de { message, code, statusCode }
                 * el cual esta almacenado en error.response.data
                 */
                const message = error.response.data.message;
                throw new Error(message);
            }
        }

        console.log("Error al comunicarse con el servidor");

        throw new Error('Error al comunicarse con el servidor');
    }
)


export async function get<T>(endpoint: string): Promise<T> {
    return api.get(endpoint);
}

export async function post<T>(endpoint: string, data: object): Promise<T> {
    return api.post(endpoint, data);
}

export async function put<T>(endpoint: string, data: object): Promise<T> {
    return api.put(endpoint, data)
}

export async function patch<T>(endpoint: string, data: object): Promise<T> {
    return api.patch(endpoint, data);
}

export async function deleteR<T>(endpoint: string): Promise<T> {
    return api.delete(endpoint);
}
