
// crear-usuario.dto.ts
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { Rol } from '../enums/rol.enum'
import { CrearPacienteDto } from "src/modules/pacientes/dto/CrearPacienteDto";

export class CrearUsuarioDto {

    @IsString()
    @IsNotEmpty({ message: 'El nombre es requerido' })
    nombre!: string

    @IsString()
    @IsNotEmpty({ message: 'El apellido es requerido' })
    apellido!: string

    @IsString()
    @IsNotEmpty({ message: 'El telefono es requerido' })
    telefono!: string

    @IsEmail({}, { message: 'El correo no es válido' })
    correo!: string

    @IsString()
    @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
    contraseña!: string

    @IsEnum(Rol, { message: 'El rol no es válido' })
    rol!: Rol

    @IsOptional()
    @ValidateNested() // valida el objeto anidado también
    @Type(() => CrearPacienteDto)
    paciente?: CrearPacienteDto
}