import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

export class IniciarSesionDto {

    @IsEmail({}, { message: 'El correo no es válido' })
    @IsNotEmpty({message: 'El correo es requerido'})
    correo!: string

    @IsString()
    @IsNotEmpty({message: 'La contraseña es requerida'})
    contraseña!: string
}