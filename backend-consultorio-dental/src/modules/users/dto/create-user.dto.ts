import {
  IsEmail,
  IsEnum,
  IsDefined,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
  IsNotEmpty,
  Matches,
} from 'class-validator';

import { Type } from 'class-transformer';
import { NormalizeEmail } from 'src/infrastructure/common/decorators/normalize-email.decorator';
import { NormalizePhone } from 'src/infrastructure/common/decorators/normalize-phone.decorator';
import { Role } from '../enums/rol.enum';
import { CreatePatientDto } from 'src/modules/patients/dto/create-patient.dto';

export class CreateUserDto {
  @IsDefined({ message: 'El nombre es requerido' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString({ message: 'El nombre debe ser un texto plano' })
  name!: string;

  @IsDefined({ message: 'El apellido es requerido' })
  @IsNotEmpty({ message: 'El apellido es requerido' })
  @IsString({ message: 'El apellido debe ser un texto plano' })
  lastname!: string;

  @IsDefined({ message: 'El telefono es requerido' })
  @IsNotEmpty({ message: 'El telefono es requerido' })
  @NormalizePhone()
  @Matches(/^\+?\d{10,15}$/, {
    message: 'El teléfono debe tener entre 10 y 15 dígitos',
  })
  @IsString({ message: 'El telefono debe ser un texto plano' })
  phone!: string;

  @IsDefined({ message: 'El correo es requerido' })
  @IsNotEmpty({ message: 'El correo es requerido' })
  @NormalizeEmail()
  @IsEmail({}, { message: 'El correo no esta en formato valido' })
  email!: string;

  @IsDefined({ message: 'La contraseña es requerida' })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @IsString({ message: 'La contraseña debe ser un texto plano' })
  @MinLength(10, { message: 'La contraseña debe tener al menos 10 caracteres' })
  @MaxLength(72, {
    message: 'La contraseña no puede superar los 72 caracteres',
  })
  password!: string;

  @IsDefined({ message: 'El rol es requerido' })
  @IsNotEmpty({ message: 'El rol es requerido' })
  @IsEnum(Role, { message: 'El rol no es válido' })
  role!: Role;

  /**
   * INDICACION:
   * @ValidateNested validará el DTO de abajo SOLO
   * si este está definido en el json de entrada
   */
  @IsOptional()
  @ValidateNested()
  @Type(() => CreatePatientDto)
  patient?: CreatePatientDto;
}
