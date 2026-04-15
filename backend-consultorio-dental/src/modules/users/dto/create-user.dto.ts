
// crear-usuario.dto.ts
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { Rol } from '../enums/rol.enum'
import { CrearPacienteDto } from "src/modules/pacientes/dto/CrearPacienteDto";

export class CreateUserDto {

    @IsString()
    @IsNotEmpty({ message: 'El nombre es requerido' })
    name!: string

    @IsString()
    @IsNotEmpty({ message: 'El apellido es requerido' })
    lastname!: string

    @IsString()
    @IsNotEmpty({ message: 'El telefono es requerido' })
    phone!: string

    @IsEmail({}, { message: 'El correo no es válido' })
    email!: string

    @IsString()
    @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
    password!: string

    @IsEnum(Rol, { message: 'El rol no es válido' })
    rol!: Rol

    @IsOptional()
    @ValidateNested() // valida el objeto anidado también
    @Type(() => CrearPacienteDto)
    patient?: CrearPacienteDto
}