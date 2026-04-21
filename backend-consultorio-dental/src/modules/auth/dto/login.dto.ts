import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

export class LoginDto {

    @IsEmail({}, { message: 'El correo no es válido' })
    @IsNotEmpty({message: 'El correo es requerido'})
    email!: string

    @IsString()
    @IsNotEmpty({message: 'La contraseña es requerida'})
    password!: string
}