import {
  IsDefined,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from 'src/infrastructure/common/dto/pagination.dto';
import { IsDateOrZonedDateTime } from 'src/infrastructure/common/utils/date-input';

/**
 * Tope por campo de texto: 50.000 caracteres. Cada peticion de /consultations
 * lleva a lo sumo 2 campos (~400 KB en UTF-8 en el peor caso), por debajo del
 * limite de body JSON de 1 MB configurado SOLO para esa ruta en main.ts (el
 * resto de la API mantiene 100 kb).
 */
const MAX_TEXT = 50000;

/**
 * Mapeo API <-> BD (se conservan las columnas existentes):
 *   description          <-> consultations.notes
 *   dentistObservations  <-> consultations.observations
 */
export class CreateConsultationDto {
  @IsDefined({ message: 'La cita es requerida' })
  @Type(() => Number)
  @IsInt({ message: 'El ID de la cita debe ser un número entero' })
  appointment_id!: number;

  @IsDefined({ message: 'La descripción es requerida' })
  @IsString({ message: 'La descripción debe ser un texto' })
  @IsNotEmpty({ message: 'La descripción es requerida' })
  @MaxLength(MAX_TEXT, {
    message: `La descripción debe tener máximo ${MAX_TEXT} caracteres`,
  })
  description!: string;

  @IsOptional()
  @IsString({ message: 'Las observaciones deben ser un texto' })
  @MaxLength(MAX_TEXT, {
    message: `Las observaciones deben tener máximo ${MAX_TEXT} caracteres`,
  })
  dentistObservations?: string;
}

export class UpdateConsultationDto {
  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto' })
  @IsNotEmpty({ message: 'La descripción no puede estar vacía' })
  @MaxLength(MAX_TEXT, {
    message: `La descripción debe tener máximo ${MAX_TEXT} caracteres`,
  })
  description?: string;

  @IsOptional()
  @IsString({ message: 'Las observaciones deben ser un texto' })
  @MaxLength(MAX_TEXT, {
    message: `Las observaciones deben tener máximo ${MAX_TEXT} caracteres`,
  })
  dentistObservations?: string;
}

export class GetConsultationsDto extends PaginationDto {
  /** Nombre o apellido del paciente. */
  @IsOptional()
  @IsString({ message: 'La búsqueda debe ser un texto' })
  @MaxLength(100, { message: 'La búsqueda debe tener máximo 100 caracteres' })
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El ID del paciente debe ser un número entero' })
  patient_id?: number;

  /** Fecha de la cita: AAAA-MM-DD o ISO con zona. */
  @IsOptional()
  @IsDateOrZonedDateTime({
    message: 'La fecha inicial debe ser AAAA-MM-DD o ISO 8601 con zona',
  })
  from?: string;

  @IsOptional()
  @IsDateOrZonedDateTime({
    message: 'La fecha final debe ser AAAA-MM-DD o ISO 8601 con zona',
  })
  to?: string;
}
