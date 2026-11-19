export interface UpdateUserDto {
    name?: string;
    lastname?: string;
    email?: string;
    phone?: string;
    /** Solo ADMINISTRADOR o ASISTENTE; los pacientes no cambian de rol. */
    role?: string;
    /** Obligatoria cuando el ADMINISTRADOR cambia SU PROPIO correo (el backend cierra sus sesiones al cambiarlo). */
    current_password?: string;
}
