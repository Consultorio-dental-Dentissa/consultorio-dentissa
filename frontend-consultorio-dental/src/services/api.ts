import type { ApiResponse } from '@/types/api.response';
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true
});

/**
 * Evita que varias peticiones que expiran al mismo tiempo disparen
 * cada una su propia llamada a /auth/refresh: todas comparten esta
 * misma promesa mientras el refresh está en curso.
 */
let refreshPromise: Promise<unknown> | null = null;

function refreshAccessToken() {
    if (!refreshPromise) {
        refreshPromise = api.post('/auth/refresh').finally(() => {
            refreshPromise = null;
        });
    }

    return refreshPromise;
}

api.interceptors.response.use(
    (response) => {

        if (response.data.success && response.data.data) {
            const apiResponse: ApiResponse<any> = response.data;
            response.data = apiResponse;

        } else {
            console.warn('`[API] Endpoint ${response.config.url} sin formato ApiResponse`');
            throw new Error('Hubo un problema inesperado. Espera porfavor');
        }

        return response.data;
    },
    async (error) => {

        if (!axios.isAxiosError(error)) {
            console.log("Error no esperado");

            throw new Error('Error desconocido');
        }

        const originalRequest = error.config as (typeof error.config & { _retry?: boolean });
        const isAuthEndpoint = originalRequest?.url?.includes('/auth/login') || originalRequest?.url?.includes('/auth/refresh');

        if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthEndpoint) {
            originalRequest._retry = true;

            try {
                await refreshAccessToken();
                return api(originalRequest);
            } catch {
                /**
                 * El refresh token tambien expiró o fue revocado.
                 * Avisamos a la app para que cierre la sesión.
                 */
                window.dispatchEvent(new Event('auth:session-expired'));
            }
        }

        /* --RECORDAR: Manejar el contrato de respuestas de error */
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


export async function get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return api.get(endpoint);
}

export async function post<T>(endpoint: string, data: object): Promise<ApiResponse<T>> {
    return api.post(endpoint, data);
}

export async function put<T>(endpoint: string, data: object): Promise<ApiResponse<T>> {
    return api.put(endpoint, data)
}

export async function patch<T>(endpoint: string, data: object): Promise<ApiResponse<T>> {
    return api.patch(endpoint, data);
}

export async function deleteR<T>(endpoint: string): Promise<ApiResponse<T>> {
    return api.delete(endpoint);
}
