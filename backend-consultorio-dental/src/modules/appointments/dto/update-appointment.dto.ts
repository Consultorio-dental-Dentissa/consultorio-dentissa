import {
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { Transform } from 'class-transformer';

/** Un campo omitido (undefined) no se valida; null SI falla. */
const present = (_: unknown, value: unknown) => value !== undefined;

/**
 * Edicion parcial de una cita: SOLO servicio y notas. La fecha NO se cambia
 * aqui (PATCH /appointments/:id/reschedule, que exige motivo e historial).
 * Debe enviarse al menos un campo (se valida en el service).
 */
export class UpdateAppointmentDto {
  @ValidateIf(present)
  @IsInt({ message: 'El ID del servicio debe ser un número entero' })
  service_id?: number;

  @ValidateIf(present)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString({ message: 'La nota debe ser un texto plano' })
  @IsNotEmpty({ message: 'La nota de la cita no puede estar vacía' })
  @MaxLength(300, {
    message: 'La nota de la cita debe tener maximo 300 caracteres',
  })
  notes?: string;
}
