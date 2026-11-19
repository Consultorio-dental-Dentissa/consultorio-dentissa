import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsDefined,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';
import {
  IsCalendarDate,
  IsDateOrZonedDateTime,
} from 'src/infrastructure/common/utils/date-input';
import { PaginationDto } from 'src/infrastructure/common/dto/pagination.dto';
import {
  parseStatusFilter,
  STATUS_FILTER_MESSAGE,
} from 'src/infrastructure/common/utils/status-filter';

export class CreateOfferDto {
  @IsDefined({ message: 'El título de la oferta es requerido' })
  @IsString({ message: 'El título debe ser un texto' })
  @IsNotEmpty({ message: 'El título de la oferta es requerido' })
  @MaxLength(150, { message: 'El título debe tener máximo 150 caracteres' })
  name!: string;

  @IsDefined({ message: 'La descripción de la oferta es requerida' })
  @IsString({ message: 'La descripción debe ser un texto' })
  @IsNotEmpty({ message: 'La descripción de la oferta es requerida' })
  @MaxLength(1000, {
    message: 'La descripción debe tener máximo 1000 caracteres',
  })
  description!: string;

  /** YYYY-MM-DD (dia local del consultorio) o fecha-hora ISO 8601 con zona. */
  @IsDefined({ message: 'La fecha de inicio es requerida' })
  @IsDateOrZonedDateTime({
    message:
      'La fecha de inicio no es válida. Debe ser AAAA-MM-DD o una fecha-hora ISO 8601 con zona (Z u offset)',
  })
  start_date!: string;

  @IsDefined({ message: 'La fecha de fin es requerida' })
  @IsDateOrZonedDateTime({
    message:
      'La fecha de fin no es válida. Debe ser AAAA-MM-DD o una fecha-hora ISO 8601 con zona (Z u offset)',
  })
  end_date!: string;

  @IsDefined({ message: 'El estado de la oferta es requerido' })
  @IsBoolean({ message: 'El estado debe ser verdadero o falso' })
  status!: boolean;

  @IsOptional()
  @IsArray({ message: 'Los servicios deben ser una lista de IDs' })
  @ArrayMaxSize(50, { message: 'Se permiten máximo 50 servicios por oferta' })
  @ArrayUnique({ message: 'Los servicios no pueden repetirse' })
  @IsInt({ each: true, message: 'Cada servicio debe ser un ID entero' })
  @Min(1, { each: true, message: 'Cada servicio debe ser un ID válido' })
  serviceIds?: number[];
}

export class UpdateOfferDto {
  @IsOptional()
  @IsString({ message: 'El título debe ser un texto' })
  @IsNotEmpty({ message: 'El título no puede estar vacío' })
  @MaxLength(150, { message: 'El título debe tener máximo 150 caracteres' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto' })
  @IsNotEmpty({ message: 'La descripción no puede estar vacía' })
  @MaxLength(1000, {
    message: 'La descripción debe tener máximo 1000 caracteres',
  })
  description?: string;

  @IsOptional()
  @IsDateOrZonedDateTime({
    message:
      'La fecha de inicio no es válida. Debe ser AAAA-MM-DD o una fecha-hora ISO 8601 con zona (Z u offset)',
  })
  start_date?: string;

  @IsOptional()
  @IsDateOrZonedDateTime({
    message:
      'La fecha de fin no es válida. Debe ser AAAA-MM-DD o una fecha-hora ISO 8601 con zona (Z u offset)',
  })
  end_date?: string;

  /** Si se envia, reemplaza por completo la lista de servicios de la oferta. */
  @IsOptional()
  @IsArray({ message: 'Los servicios deben ser una lista de IDs' })
  @ArrayMaxSize(50, { message: 'Se permiten máximo 50 servicios por oferta' })
  @ArrayUnique({ message: 'Los servicios no pueden repetirse' })
  @IsInt({ each: true, message: 'Cada servicio debe ser un ID entero' })
  @Min(1, { each: true, message: 'Cada servicio debe ser un ID válido' })
  serviceIds?: number[];
}

export class UpdateOfferStatusDto {
  @IsDefined({ message: 'El estado es requerido' })
  @IsBoolean({ message: 'El estado debe ser verdadero o falso' })
  status!: boolean;
}

export class GetOffersDto extends PaginationDto {
  @IsOptional()
  @IsString({ message: 'La búsqueda debe ser un texto' })
  @MaxLength(100, { message: 'La búsqueda debe tener máximo 100 caracteres' })
  search?: string;

  /** Solo lo respetan los endpoints de administracion. */
  @IsOptional()
  @Transform(parseStatusFilter)
  @IsBoolean({ message: STATUS_FILTER_MESSAGE })
  status?: boolean;

  /** Solo administracion: ofertas cuya vigencia incluye este dia (YYYY-MM-DD). */
  @IsOptional()
  @IsCalendarDate({
    message: 'La fecha de vigencia debe ser un día real con formato AAAA-MM-DD',
  })
  date?: string;
}
