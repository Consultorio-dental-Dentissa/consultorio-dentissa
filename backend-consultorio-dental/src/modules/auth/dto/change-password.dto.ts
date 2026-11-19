import {
  IsDefined,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class ChangePasswordDto {
  @IsDefined({ message: 'La contraseña actual es requerida' })
  @IsNotEmpty({ message: 'La contraseña actual es requerida' })
  @IsString({ message: 'La contraseña actual debe ser un texto plano' })
  currentPassword!: string;

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
