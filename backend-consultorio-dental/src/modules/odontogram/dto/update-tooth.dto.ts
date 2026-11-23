import { Transform } from 'class-transformer';
import {
  IsDefined,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ToothStatus } from '@prisma/client';
import { MAX_TOOTH_NOTE_LENGTH } from '../odontogram.constants';

export class UpdateToothDto {
  @IsDefined({ message: 'El estado del diente es requerido' })
  @IsEnum(ToothStatus, {
    message: 'El estado debe ser SANO, CARIES, REMOVIDO o CORONA',
  })
  status!: ToothStatus;

  /** trim; vacia = null. */
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    return trimmed === '' ? null : trimmed;
  })
  @IsString({ message: 'La nota debe ser un texto' })
  @MaxLength(MAX_TOOTH_NOTE_LENGTH, {
    message: `La nota debe tener máximo ${MAX_TOOTH_NOTE_LENGTH} caracteres`,
  })
  notes?: string | null;
}
