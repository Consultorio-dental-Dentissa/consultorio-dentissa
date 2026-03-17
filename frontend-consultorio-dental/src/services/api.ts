import { ApiError } from "../types/Respuestas/ApiError";

const url_api = import.meta.env.VITE_API_URL

// POST
export async function post<T>(endpoint: string, datos: object): Promise<T> {

    try {
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
    } catch (error) {

        // Si YA es un error controlado tuyo, lo dejas pasar
        if (error instanceof ApiError) {
            throw error;
        }

        throw new ApiError(
            'Hubo un error al comunicarse con el servidor',
            'Internal Server Error',
            500
        );
    }

}

// GET
export async function get<T>(endpoint: string, id?: number): Promise<T> {

    try {
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
        
    } catch(error) {

        // Si YA es un error controlado tuyo, lo dejas pasar
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(
            'Hubo un error al comunicarse con el servidor',
            'Internal Server Error',
            500
        );
    }

}





// PUT
export async function put<T>(endpoint: string, id: number, datos: object): Promise<T> {

    try {
        const respuesta = await fetch(`${url_api}${endpoint}/${id}`, {
            method: 'PUT',
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
    } catch (error) {

        if (error instanceof ApiError) {
            throw error;
        }

        throw new ApiError(
            'Hubo un error al comunicarse con el servidor',
            'Internal Server Error',
            500
        );
    }
}


// DELETE
export async function deleteR<T>(endpoint: string, id: number): Promise<T> {

    try {
        const respuesta = await fetch(`${url_api}${endpoint}/${id}`, {
            method: 'DELETE',
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
    } catch (error) {

        if (error instanceof ApiError) {
            throw error;
        }

        throw new ApiError(
            'Hubo un error al comunicarse con el servidor',
            'Internal Server Error',
            500
        );
    }
}