import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { IsDateOrZonedDateTime } from 'src/infrastructure/common/utils/date-input';
import { NormalizeEmail } from 'src/infrastructure/common/decorators/normalize-email.decorator';
import { NormalizePhone } from 'src/infrastructure/common/decorators/normalize-phone.decorator';
import { PaginationDto } from 'src/infrastructure/common/dto/pagination.dto';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

/**
 * Campos que el PACIENTE puede modificar de su propio perfil (spec 01):
 * correo, telefono y telefono de emergencia. NO incluye contrasena
 * (PATCH /auth/password) ni ningun dato clinico o administrativo; el
 * patientId siempre sale del usuario autenticado, nunca del body.
 */
export class UpdateMyProfileDto {
  @IsOptional()
  @NormalizeEmail()
  @IsEmail({}, { message: 'El correo no esta en formato valido' })
  @MaxLength(254, { message: 'El correo es demasiado largo' })
  email?: string;

  @IsOptional()
  @NormalizePhone()
  @Matches(/^\+?\d{10,15}$/, {
    message: 'El teléfono debe tener entre 10 y 15 dígitos',
  })
  @IsString({ message: 'El telefono debe ser un texto plano' })
  @IsNotEmpty({ message: 'El telefono no puede estar vacío' })
  @MaxLength(30, { message: 'El telefono debe tener maximo 30 caracteres' })
  phone?: string;

  @IsOptional()
  @NormalizePhone()
  @Matches(/^\+?\d{10,15}$/, {
    message: 'El teléfono debe tener entre 10 y 15 dígitos',
  })
  @IsString({ message: 'El telefono de emergencia debe ser un texto plano' })
  @IsNotEmpty({ message: 'El telefono de emergencia no puede estar vacío' })
  @MaxLength(30, {
    message: 'El telefono de emergencia debe tener maximo 30 caracteres',
  })
  emergency_phone?: string;

  /** Obligatoria solo al cambiar el correo (evita secuestro de cuenta con una sesion robada). */
  @IsOptional()
  @IsString({ message: 'La contraseña actual debe ser un texto plano' })
  @MaxLength(72, {
    message: 'La contraseña no puede superar los 72 caracteres',
  })
  current_password?: string;
}

/** Edicion de un paciente por el ADMIN. */
export class AdminUpdatePatientDto {
  @IsOptional()
  @Transform(trim)
  @IsString({ message: 'El nombre debe ser un texto plano' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  @MaxLength(100, { message: 'El nombre debe tener maximo 100 caracteres' })
  name?: string;

  @IsOptional()
  @Transform(trim)
  @IsString({ message: 'El apellido debe ser un texto plano' })
  @IsNotEmpty({ message: 'El apellido no puede estar vacío' })
  @MaxLength(100, { message: 'El apellido debe tener maximo 100 caracteres' })
  lastname?: string;

  @IsOptional()
  @NormalizeEmail()
  @IsEmail({}, { message: 'El correo no esta en formato valido' })
  @MaxLength(254, { message: 'El correo es demasiado largo' })
  email?: string;

  @IsOptional()
  @NormalizePhone()
  @Matches(/^\+?\d{10,15}$/, {
    message: 'El teléfono debe tener entre 10 y 15 dígitos',
  })
  @IsString({ message: 'El telefono debe ser un texto plano' })
  @IsNotEmpty({ message: 'El telefono no puede estar vacío' })
  @MaxLength(30, { message: 'El telefono debe tener maximo 30 caracteres' })
  phone?: string;

  @IsOptional()
  @NormalizePhone()
  @Matches(/^\+?\d{10,15}$/, {
    message: 'El teléfono debe tener entre 10 y 15 dígitos',
  })
  @IsString({ message: 'El telefono de emergencia debe ser un texto plano' })
  @IsNotEmpty({ message: 'El telefono de emergencia no puede estar vacío' })
  @MaxLength(30, {
    message: 'El telefono de emergencia debe tener maximo 30 caracteres',
  })
  emergency_phone?: string;

  @IsOptional()
  @Transform(trim)
  @IsString({ message: 'La dirección debe ser un texto plano' })
  @IsNotEmpty({ message: 'La dirección no puede estar vacía' })
  @MaxLength(300, { message: 'La dirección debe tener maximo 300 caracteres' })
  address?: string;

  @IsOptional()
  @IsDateOrZonedDateTime({
    message:
      'La fecha de nacimiento no es válida (usa AAAA-MM-DD o ISO 8601 con zona)',
  })
  birth_date?: string;

  /** Activa/desactiva la cuenta del paciente (users.status), atomico con el resto. */
  @IsOptional()
  @IsBoolean({ message: 'El estado debe ser verdadero o falso' })
  status?: boolean;
}

export class GetPatientHistoryDto extends PaginationDto {
  /** appointments (por defecto) o consultations (solo ADMIN). */
  @IsOptional()
  @IsIn(['appointments', 'consultations'], {
    message: 'El tipo debe ser appointments o consultations',
  })
  type?: 'appointments' | 'consultations';
}
