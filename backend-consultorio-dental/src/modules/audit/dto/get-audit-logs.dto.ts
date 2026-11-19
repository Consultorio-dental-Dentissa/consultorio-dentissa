import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';
import { IsDateOrZonedDateTime } from 'src/infrastructure/common/utils/date-input';
import { Type } from 'class-transformer';
import { PaginationDto } from 'src/infrastructure/common/dto/pagination.dto';

export class GetAuditLogsDto extends PaginationDto {
  @IsOptional()
  @IsString({ message: 'La acción debe ser un texto' })
  @MaxLength(60, { message: 'La acción debe tener máximo 60 caracteres' })
  action?: string;

  @IsOptional()
  @IsString({ message: 'La entidad debe ser un texto' })
  @MaxLength(60, { message: 'La entidad debe tener máximo 60 caracteres' })
  entity?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El ID de la entidad debe ser un número entero' })
  entityId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El ID del usuario debe ser un número entero' })
  userId?: number;

  @IsOptional()
  @IsDateOrZonedDateTime({
    message:
      'La fecha inicial no es válida. Usa AAAA-MM-DD o fecha-hora ISO 8601 con zona (Z u offset)',
  })
  from?: string;

  @IsOptional()
  @IsDateOrZonedDateTime({
    message:
      'La fecha final no es válida. Usa AAAA-MM-DD o fecha-hora ISO 8601 con zona (Z u offset)',
  })
  to?: string;
}
