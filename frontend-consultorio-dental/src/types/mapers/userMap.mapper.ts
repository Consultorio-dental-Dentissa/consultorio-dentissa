import type { RespuestaUsuario } from "../api/responses/RespuestaUsuario";
import type { User } from "../models/User";

export function userMap(data: RespuestaUsuario): User {
    return {
        name: data.name,
        lastname: data.lastname,
        rol: data.rol.rol,
        email: data.email,
        phone: data.phone,
        status: data.status,
        id: data.id
    }
}