export interface RespuestaPaciente {
    id: number;
    address: string;
    birth_date: string;
    emergency_phone: string;
    user: {
        name: string,
        lastname: string,
        email: string,
        phone: string
    }
}