export interface ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}

export interface ResetPasswordDto {
    token: string;
    newPassword: string;
}
