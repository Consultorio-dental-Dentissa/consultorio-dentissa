export interface CreateUserDto {
    name: string;
    lastname: string;
    email: string;
    phone: string;
    password: string;
    rol: string;
    patient?: {
        address: string,
        birth_date: string,
        emergency_phone: string
    }
}