export interface CrearUsuarioDto {
    nombre: string;
    correo: string;
    contraseña: string;
    telefono: string;
    rol: string;
    paciente?: {
        nombre: string,
        apellido: string,
        direccion: string,
        fecha_nacimiento: Date,
        telefono: string,
        telefono_emergencia: string
    }
}