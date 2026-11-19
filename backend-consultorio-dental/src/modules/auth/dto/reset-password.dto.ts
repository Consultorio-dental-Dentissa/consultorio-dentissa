import {
  IsDefined,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class ResetPasswordDto {
  @IsDefined({ message: 'El token es requerido' })
  @IsNotEmpty({ message: 'El token es requerido' })
  @IsString({ message: 'El token debe ser un texto plano' })
  @MaxLength(256, { message: 'El token no es válido' })
  token!: string;

  @IsDefined({ message: 'La nueva contraseña es requerida' })
  @IsNotEmpty({ message: 'La nueva contraseña es requerida' })
  @IsString({ message: 'La nueva contraseña debe ser un texto plano' })
  @MinLength(10, {
    message: 'La nueva contraseña debe tener al menos 10 caracteres',
  })
  @MaxLength(72, {
    message: 'La nueva contraseña no puede superar los 72 caracteres',
  })
  newPassword!: string;
}
