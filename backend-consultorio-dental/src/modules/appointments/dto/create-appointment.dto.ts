import {
  IsDefined,
  IsOptional,
  IsString,
  IsNotEmpty,
  IsDate,
  MinDate,
  MaxLength,
  IsInt,
} from 'class-validator';

import { Type } from 'class-transformer';

export class CreateAppointmentDto {
  @IsDefined({ message: 'La fecha de la cita es requerida' })
  @IsNotEmpty({ message: 'La fecha de la cita es requerida' })
  @IsDate({ message: 'La fecha de la cita no es valida' })
  @MinDate(() => new Date(), {
    message:
      'La fecha de la cita no puede ser anterior a la fecha y hora actual',
  })
  @Type(() => Date)
  scheduled_at!: Date;

  @IsDefined({ message: 'La nota de la cita es requerida' })
  @IsNotEmpty({ message: 'La nota de la cita es requerida' })
  @IsString({ message: 'La nota debe ser un texto plano' })
  @MaxLength(300, {
    message: 'La nota de la cita debe tener maximo 300 caracteres',
  })
  notes!: string;

  /**
   * INDICACIÓN:
   * Requerido para ADMIN/ASISTENTE (se valida en el service).
   * Para PACIENTE se ignora y se toma del usuario autenticado.
   */
  @IsOptional()
  @IsInt({ message: 'El ID del paciente debe ser un número entero' })
  patient_id?: number;

  @IsDefined({ message: 'El servicio es requerido' })
  @IsNotEmpty({ message: 'El servicio es requerido' })
  @IsInt({ message: 'El ID del servicio debe ser un número entero' })
  service_id!: number;
}
