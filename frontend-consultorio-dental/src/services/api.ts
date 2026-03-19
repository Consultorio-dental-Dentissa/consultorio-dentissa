import { ApiError } from "../types/respuestas/ApiError";

const url_api = import.meta.env.VITE_API_URL


function obtenerToken() {
    return localStorage.getItem('token');
}


async function request<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {

    try {
        const respuesta = await fetch(url_api + endpoint, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${obtenerToken()}`,
                ...options.headers,
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
        if (error instanceof ApiError) throw error;

        throw new ApiError(
            'Hubo un error al comunicarse con el servidor',
            'Internal Server Error',
            500
        );
    }
}




// POST
export async function post<T>(endpoint: string, datos: object): Promise<T> {

   return await request(endpoint, {
        method: 'POST',
        body: JSON.stringify(datos)
   })

}



// GET
export function get<T>(endpoint: string, id?: number): Promise<T> {
    
    const path = id ? `${endpoint}/${id}` : endpoint;

    return request<T>(path, {
        method: 'GET',
    });
}





// PUT
export function put<T>(endpoint: string, id: number, datos: object): Promise<T> {
    return request<T>(`${endpoint}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(datos),
    });
}




// DELETE
export function deleteR<T>(endpoint: string, id: number): Promise<T> {
    
    return request<T>(`${endpoint}/${id}`, {
        method: 'DELETE'
    })
}