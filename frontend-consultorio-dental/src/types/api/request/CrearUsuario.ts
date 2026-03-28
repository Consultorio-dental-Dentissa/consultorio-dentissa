export interface CrearUsuario {
    nombre: string;
    apellido: string;
    correo: string;
    telefono: string;
    contraseña: string;
    rol: string;
    paciente?: {
        direccion: string,
        fecha_nacimiento: string,
        telefono_emergencia: string
    }
}