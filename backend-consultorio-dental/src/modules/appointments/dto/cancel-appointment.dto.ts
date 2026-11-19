import { IsDefined, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CancelAppointmentDto {
  @IsDefined({ message: 'El motivo de la cancelación es requerido' })
  @IsString({ message: 'El motivo debe ser un texto plano' })
  @IsNotEmpty({ message: 'El motivo de la cancelación es requerido' })
  @MaxLength(500, {
    message: 'El motivo debe tener maximo 500 caracteres',
  })
  reason!: string;
}
