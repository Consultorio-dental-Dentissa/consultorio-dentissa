import type { RespuestaLogin } from "../types/RespuestaLogin";
import { post } from "./api"

export async function iniciar_sesion(credenciales : any) {
    return await post<RespuestaLogin>('/auth', credenciales);
}