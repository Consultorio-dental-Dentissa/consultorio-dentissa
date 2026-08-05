export interface UserResponse {
    id: number;
    name: string;
    lastname: string;
    email: string;
    phone: string;
    status: boolean;
    created_at: string;
    role: {
        id: number,
        role: string
    };

}