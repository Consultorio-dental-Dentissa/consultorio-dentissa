import {
  IsOptional,
  IsInt,
  IsEnum,
  IsString,
  IsIn,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { AppointmentStatus } from '@prisma/client';
import { IsDateOrZonedDateTime } from 'src/infrastructure/common/utils/date-input';
import { PaginationDto } from 'src/infrastructure/common/dto/pagination.dto';

export class GetAppointmentsDto extends PaginationDto {
  @IsOptional()
  @IsInt({ message: 'El ID del paciente debe ser un número' })
  @Type(() => Number)
  patient_id?: number;

  @IsOptional()
  @IsString({ message: 'La búsqueda debe ser un texto' })
  @MaxLength(100, { message: 'La búsqueda debe tener máximo 100 caracteres' })
  search?: string;

  @IsOptional()
  // Si llega repetido (array) u otro tipo, se deja tal cual y IsEnum responde 400
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.toUpperCase() : value,
  )
  @IsEnum(AppointmentStatus, {
    message: `El estatus debe ser de: ${Object.values(AppointmentStatus).join(', ')}`,
  })
  status?: AppointmentStatus;

  @IsOptional()
  @IsDateOrZonedDateTime({
    message: 'from debe ser AAAA-MM-DD válida o fecha ISO con zona horaria',
  })
  from?: string;

  @IsOptional()
  @IsDateOrZonedDateTime({
    message: 'to debe ser AAAA-MM-DD válida o fecha ISO con zona horaria',
  })
  to?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'], { message: 'sort debe ser asc o desc' })
  sort?: 'asc' | 'desc';

  /** Solo ADMIN: citas COMPLETADA que aun no tienen consulta registrada. */
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    value === 'true' ? true : value === 'false' ? false : value,
  )
  @IsBoolean({
    message: 'completed_without_consultation debe ser true o false',
  })
  completed_without_consultation?: boolean;
}
