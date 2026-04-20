export interface UserResponse {
    id: number;
    name: string;
    lastname: string;
    email: string;
    phone: string;
    status: boolean;
    rol: {
        id: number,
        rol: string
    };

}