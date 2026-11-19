import {
  IsDate,
  IsDefined,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinDate,
} from 'class-validator';
import { Type } from 'class-transformer';

export class RescheduleAppointmentDto {
  @IsDefined({ message: 'La nueva fecha de la cita es requerida' })
  @IsNotEmpty({ message: 'La nueva fecha de la cita es requerida' })
  @IsDate({ message: 'La nueva fecha de la cita no es valida' })
  @MinDate(() => new Date(), {
    message:
      'La nueva fecha de la cita no puede ser anterior a la fecha y hora actual',
  })
  @Type(() => Date)
  scheduled_at!: Date;

  @IsDefined({ message: 'El motivo de la reprogramación es requerido' })
  @IsString({ message: 'El motivo debe ser un texto plano' })
  @IsNotEmpty({ message: 'El motivo de la reprogramación es requerido' })
  @MaxLength(500, {
    message: 'El motivo debe tener maximo 500 caracteres',
  })
  reason!: string;
}
