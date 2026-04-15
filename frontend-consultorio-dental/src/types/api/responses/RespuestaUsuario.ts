export interface RespuestaUsuario {
    id: number;
    name: string;
    lastname: string;
    email: string;
    phone: string | null;
    status: boolean;
    rol: {
        id: number,
        rol: string
    };

}