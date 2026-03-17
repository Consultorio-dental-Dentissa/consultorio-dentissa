import type { RespuestaLogin } from "../types/RespuestaLogin";
import { post } from "./api"

export async function requestLogin(credenciales : any): Promise<RespuestaLogin> {
    return await post<RespuestaLogin>('/auth/iniciar-sesion', credenciales);
}