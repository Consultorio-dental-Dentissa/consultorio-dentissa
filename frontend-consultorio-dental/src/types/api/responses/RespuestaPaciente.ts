export interface RespuestaPaciente {
    id: number;
    direccion: string;
    fecha_nacimiento: string;
    telefono_emergencia: string;
    usuario: {
        nombre: string,
        apellido: string,
        correo: string,
        telefono: string
    }
}