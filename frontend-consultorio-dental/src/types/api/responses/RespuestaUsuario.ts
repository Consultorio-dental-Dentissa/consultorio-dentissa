export interface RespuestaUsuario {
    id: number;
    nombre: string;
    apellido: string;
    correo: string;
    telefono: string | null;
    activo: boolean;
    rol: {
        id: number,
        rol: string
    };

}