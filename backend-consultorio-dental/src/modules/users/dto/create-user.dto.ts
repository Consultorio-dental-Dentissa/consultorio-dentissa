
// crear-usuario.dto.ts
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { Role } from '../enums/rol.enum'
import { CreatePatientDto } from "src/modules/patients/dto/create-patient.dto";

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

    @IsEnum(Role, { message: 'El rol no es válido' })
    role!: Role

    @IsOptional()
    @ValidateNested() // valida el objeto anidado también
    @Type(() => CreatePatientDto)
    patient?: CreatePatientDto
}