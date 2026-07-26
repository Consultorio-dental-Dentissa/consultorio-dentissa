import {
    IsDefined,
    IsEnum,
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator';

import { TOOTH_STATUS } from '@prisma/client';

export class UpdateToothDto {

    @IsDefined({ message: 'El estatus es requerido' })
    @IsEnum(TOOTH_STATUS, { message: `El estatus debe ser uno de: ${Object.values(TOOTH_STATUS)}` })
    status!: TOOTH_STATUS;

    @IsOptional()
    @IsString({ message: 'La nota debe ser un texto plano' })
    @MaxLength(200, { message: 'La nota debe tener maximo 200 caracteres' })
    note?: string;
}
