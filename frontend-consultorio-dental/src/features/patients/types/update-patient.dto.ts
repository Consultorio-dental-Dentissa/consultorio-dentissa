/** PATCH /patients/:id (solo ADMIN). Solo se envían los campos modificados. */
export interface UpdatePatientDto {
    name?: string;
    lastname?: string;
    email?: string;
    phone?: string;
    emergency_phone?: string;
    address?: string;
    birth_date?: string;
    /** Activa/desactiva la cuenta del paciente; el backend lo aplica de forma atómica con el resto de campos. */
    status?: boolean;
}

/** PATCH /patients/me (PACIENTE): solo correo, teléfono y teléfono de emergencia. */
export interface UpdateMyProfileDto {
    email?: string;
    phone?: string;
    emergency_phone?: string;
    /** Obligatoria únicamente si se cambia el correo. */
    current_password?: string;
}
