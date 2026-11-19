import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { NormalizeEmail } from 'src/infrastructure/common/decorators/normalize-email.decorator';
import { NormalizePhone } from 'src/infrastructure/common/decorators/normalize-phone.decorator';
import { Role } from '../enums/rol.enum';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

/** Un campo omitido (undefined) no se valida; null SI falla (no es "omitido"). */
const present = (_: unknown, value: unknown) => value !== undefined;

/**
 * Edicion de un usuario por el ADMIN. Todos los campos son opcionales, pero
 * debe enviarse al menos uno (se valida en el service). No incluye la
 * contrasena ni el estado (tienen sus propios endpoints).
 */
export class UpdateUserDto {
  @ValidateIf(present)
  @Transform(trim)
  @IsString({ message: 'El nombre debe ser un texto plano' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  @MaxLength(100, { message: 'El nombre debe tener maximo 100 caracteres' })
  name?: string;

  @ValidateIf(present)
  @Transform(trim)
  @IsString({ message: 'El apellido debe ser un texto plano' })
  @IsNotEmpty({ message: 'El apellido no puede estar vacío' })
  @MaxLength(100, { message: 'El apellido debe tener maximo 100 caracteres' })
  lastname?: string;

  @ValidateIf(present)
  @NormalizeEmail()
  @IsEmail({}, { message: 'El correo no esta en formato valido' })
  @MaxLength(254, { message: 'El correo es demasiado largo' })
  email?: string;

  @ValidateIf(present)
  @NormalizePhone()
  @Matches(/^\+?\d{10,15}$/, {
    message: 'El teléfono debe tener entre 10 y 15 dígitos',
  })
  @IsString({ message: 'El telefono debe ser un texto plano' })
  phone?: string;

  @ValidateIf(present)
  @IsEnum(Role, { message: 'El rol no es válido' })
  role?: Role;

  /**
   * Solo se usa cuando el ADMIN cambia el correo de SU PROPIA cuenta. Nunca se
   * guarda ni se audita.
   */
  @ValidateIf(present)
  @IsString({ message: 'La contraseña actual debe ser un texto plano' })
  @MaxLength(72, {
    message: 'La contraseña no puede superar los 72 caracteres',
  })
  current_password?: string;
}
