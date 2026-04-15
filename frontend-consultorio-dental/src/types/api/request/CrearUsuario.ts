export interface CrearUsuario {
    name: string;
    lastname: string;
    email: string;
    phone: string;
    password: string;
    rol: string;
    patient?: {
        direccion: string,
        fecha_nacimiento: string,
        telefono_emergencia: string
    }
}