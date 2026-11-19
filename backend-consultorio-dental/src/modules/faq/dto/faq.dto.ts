import {
  IsBoolean,
  IsDefined,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationDto } from 'src/infrastructure/common/dto/pagination.dto';
import {
  parseStatusFilter,
  STATUS_FILTER_MESSAGE,
} from 'src/infrastructure/common/utils/status-filter';

export class CreateFaqDto {
  @IsDefined({ message: 'La pregunta es requerida' })
  @IsString({ message: 'La pregunta debe ser un texto' })
  @IsNotEmpty({ message: 'La pregunta es requerida' })
  @MaxLength(300, { message: 'La pregunta debe tener máximo 300 caracteres' })
  question!: string;

  @IsDefined({ message: 'La respuesta es requerida' })
  @IsString({ message: 'La respuesta debe ser un texto' })
  @IsNotEmpty({ message: 'La respuesta es requerida' })
  @MaxLength(2000, {
    message: 'La respuesta debe tener máximo 2000 caracteres',
  })
  response!: string;

  @IsOptional()
  @IsBoolean({ message: 'El estado debe ser verdadero o falso' })
  status?: boolean;
}

export class UpdateFaqDto {
  @IsOptional()
  @IsString({ message: 'La pregunta debe ser un texto' })
  @IsNotEmpty({ message: 'La pregunta no puede estar vacía' })
  @MaxLength(300, { message: 'La pregunta debe tener máximo 300 caracteres' })
  question?: string;

  @IsOptional()
  @IsString({ message: 'La respuesta debe ser un texto' })
  @IsNotEmpty({ message: 'La respuesta no puede estar vacía' })
  @MaxLength(2000, {
    message: 'La respuesta debe tener máximo 2000 caracteres',
  })
  response?: string;
}

export class UpdateFaqStatusDto {
  @IsDefined({ message: 'El estado es requerido' })
  @IsBoolean({ message: 'El estado debe ser verdadero o falso' })
  status!: boolean;
}

export class GetFaqDto extends PaginationDto {
  @IsOptional()
  @IsString({ message: 'La búsqueda debe ser un texto' })
  @MaxLength(100, { message: 'La búsqueda debe tener máximo 100 caracteres' })
  search?: string;

  /** Solo lo respetan los endpoints de administración. */
  @IsOptional()
  @Transform(parseStatusFilter)
  @IsBoolean({ message: STATUS_FILTER_MESSAGE })
  status?: boolean;
}
