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
    console.log(respuesta_json);

    if (!respuesta.ok) {
        throw respuesta_json;
    }

    return respuesta_json;
}








export function get(endpoint: string, id?: number): Promise<Response> {

    const path = id ? `${endpoint}/${id}` : endpoint;

    console.log(url_api + path);

    try {
        return fetch(url_api + path, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        throw new Error('No se pudo conectar al servidor');
    }

}