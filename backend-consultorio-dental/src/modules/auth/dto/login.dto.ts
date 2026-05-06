import { IsEmail, IsDefined, IsNotEmpty, IsString } from 'class-validator'

export class LoginDto {

    @IsDefined({ message: "El correo es requerido" })
    @IsNotEmpty({ message: "El correo es requerido" })
    @IsEmail({}, { message: "El correo no esta en un formato valido" })
    email!: string;

    @IsDefined({ message: "La contraseña es requerida" })
    @IsNotEmpty({ message: "La contraseña es requerida" })
    @IsString({ message: "La contraseña debe ser un texto plano" })
    password!: string;
}