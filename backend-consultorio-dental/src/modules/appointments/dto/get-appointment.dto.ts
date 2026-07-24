import { IsOptional, IsInt, IsEnum, IsDateString } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { AppointmentStatus } from '@prisma/client';

export class GetAppointmentsDto {
    @IsOptional()
    @IsInt({message: 'El ID del paciente debe ser un número'})
    @Type(() => Number)
    patient_id?: number;

    @IsOptional()
    @Transform(({ value }) => value.toUpperCase())
    @IsEnum(AppointmentStatus, {message: `El estatus debe ser de: ${Object.values(AppointmentStatus)}`})
    status?: AppointmentStatus

    @IsOptional() @IsDateString()
    date?: string;
}