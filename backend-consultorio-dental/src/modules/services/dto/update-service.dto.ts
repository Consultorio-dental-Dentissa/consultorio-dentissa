import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { Transform } from 'class-transformer';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

/** Un campo omitido (undefined) no se valida; null SI falla. */
const present = (_: unknown, value: unknown) => value !== undefined;

/**
 * Edicion parcial de un servicio (solo ADMIN). No incluye `status`
 * (PATCH /services/status/:id) ni las imagenes. Al menos un campo.
 */
export class UpdateServiceDto {
  @ValidateIf(present)
  @Transform(trim)
  @IsString({ message: 'El nombre del servicio debe ser un texto plano' })
  @IsNotEmpty({ message: 'El nombre del servicio no puede estar vacío' })
  @MaxLength(150, { message: 'El nombre debe tener maximo 150 caracteres' })
  name?: string;

  @ValidateIf(present)
  @Transform(trim)
  @IsString({ message: 'La descripción del servicio debe ser un texto plano' })
  @IsNotEmpty({ message: 'La descripción del servicio no puede estar vacía' })
  @MaxLength(300, {
    message: 'La descripción debe tener maximo 300 caracteres',
  })
  description?: string;

  @ValidateIf(present)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El precio debe ser un número válido' },
  )
  @Min(0, { message: 'El precio no puede ser un número negativo' })
  price?: number;

  @ValidateIf(present)
  @IsInt({ message: 'La duración del servicio debe ser un número entero' })
  durationMinutes?: number;
}
