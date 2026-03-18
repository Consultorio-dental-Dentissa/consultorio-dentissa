export interface RespuestaUsuario {
    id: number;
    nombre: string;
    apellido: string;
    correo: string;
    telefono: string | null;
    contraseña: string;
    rol: string;
}