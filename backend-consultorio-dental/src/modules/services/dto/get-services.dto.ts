import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationDto } from 'src/infrastructure/common/dto/pagination.dto';
import {
  parseStatusFilter,
  STATUS_FILTER_MESSAGE,
} from 'src/infrastructure/common/utils/status-filter';

export class GetServicesDto extends PaginationDto {
  /** Solo lo respeta un ADMIN autenticado; para el resto siempre son activos. */
  @IsOptional()
  @Transform(parseStatusFilter)
  @IsBoolean({ message: STATUS_FILTER_MESSAGE })
  status?: boolean;

  @IsOptional()
  @IsString({ message: 'La búsqueda debe ser un texto' })
  @MaxLength(100, { message: 'La búsqueda debe tener máximo 100 caracteres' })
  search?: string;
}
