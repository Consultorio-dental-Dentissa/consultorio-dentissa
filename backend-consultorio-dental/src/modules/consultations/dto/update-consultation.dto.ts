import {
    IsDefined,
    IsNotEmpty,
    IsString,
    MaxLength,
} from 'class-validator';

export class UpdateConsultationDto {

    @IsDefined({ message: 'Las notas son requeridas' })
    @IsNotEmpty({ message: 'Las notas son requeridas' })
    @IsString({ message: 'Las notas deben ser un texto plano' })
    @MaxLength(2000, { message: 'Las notas deben tener maximo 2000 caracteres' })
    notes!: string;

    @IsDefined({ message: 'Las observaciones son requeridas' })
    @IsNotEmpty({ message: 'Las observaciones son requeridas' })
    @IsString({ message: 'Las observaciones deben ser un texto plano' })
    @MaxLength(200, { message: 'Las observaciones deben tener maximo 200 caracteres' })
    observations!: string;
}
