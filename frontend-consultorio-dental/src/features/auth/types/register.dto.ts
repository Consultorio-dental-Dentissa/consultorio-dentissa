export interface RegisterDto {
    name: string;
    lastname: string;
    email: string;
    phone: string;
    password: string;
    patient: {
        address: string;
        birth_date: string;
        emergency_phone: string;
    };
}
