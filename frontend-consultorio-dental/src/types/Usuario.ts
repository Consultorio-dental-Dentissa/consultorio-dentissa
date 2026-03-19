export interface Usuario {
    id: number;
    nombre: string;
    apellido: string;
    correo: string;
    telefono: string | null;
    activo: boolean;
    created_at: string;
    rol: {
        id: number,
        rol: string
    }
}