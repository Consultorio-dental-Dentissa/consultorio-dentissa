import { ApiError } from "../types/ApiError";

const url_api = import.meta.env.VITE_API_URL


export async function post<T>(endpoint: string, datos: object): Promise<T> {

    const respuesta = await fetch(url_api + endpoint, {
        method: 'POST',
        body: JSON.stringify(datos),
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const respuesta_json = await respuesta.json();

    if (!respuesta.ok) {
        throw new ApiError(
            respuesta_json.message,
            respuesta_json.error,
            respuesta_json.statusCode
        );
    }

    return respuesta_json;
}


export async function get<T>(endpoint: string, id?: number): Promise<T> {

    const path = id ? `${endpoint}/${id}` : endpoint;

    const respuesta = await fetch(url_api + path, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const respuesta_json = await respuesta.json();

    if (!respuesta.ok) {
        throw respuesta_json;
    }

    return respuesta_json;
}