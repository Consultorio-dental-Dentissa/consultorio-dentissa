import { NormalizePhone } from 'src/infrastructure/common/decorators/normalize-phone.decorator';
import { IsNotEmpty, IsDefined, IsString, Matches } from 'class-validator';
import { IsDateOrZonedDateTime } from 'src/infrastructure/common/utils/date-input';

export class CreatePatientDto {
  @IsDefined({ message: 'La dirección es requerida' })
  @IsNotEmpty({ message: 'La dirección es requerida' })
  @IsString({ message: 'La dirección debe ser un texto plato' })
  address!: string;

  @IsDefined({ message: 'La fecha de nacimiento es requerida' })
  @IsNotEmpty({ message: 'La fecha de nacimiento es requerida' })
  @IsDateOrZonedDateTime({
    message:
      'La fecha de nacimiento no es válida (usa AAAA-MM-DD o ISO 8601 con zona)',
  })
  birth_date!: string;

  @IsDefined({ message: 'El telefono de emergencia es requerido' })
  @IsNotEmpty({ message: 'El telefono de emergencia es requerido' })
  @NormalizePhone()
  @Matches(/^\+?\d{10,15}$/, {
    message: 'El teléfono debe tener entre 10 y 15 dígitos',
  })
  @IsString({ message: 'El telefono debe ser un texto plano' })
  emergency_phone!: string;

  /**
   * INDICACIÓN:
   * El USER_ID se asigna en el servicio. No tiene decoradores de validación,
   * por lo que ValidationPipe (whitelist) lo descarta si viene en la entrada.
   */
  user_id?: number;
}
