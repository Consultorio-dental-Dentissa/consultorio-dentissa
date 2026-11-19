import { IsOptional, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationDto } from 'src/infrastructure/common/dto/pagination.dto';

export class GetPatientsDto extends PaginationDto {
  @IsOptional()
  @Transform(({ value }) => value === 'ACTIVO')
  status?: boolean;

  @IsOptional()
  @IsString({ message: 'La búsqueda debe ser un texto' })
  @MaxLength(100, { message: 'La búsqueda debe tener máximo 100 caracteres' })
  search?: string;
}
