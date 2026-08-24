import { IsOptional, IsInt, IsEnum } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { AppointmentStatus } from '@prisma/client';

export class GetAppointmentsDto {
    @IsOptional()
    @IsInt({message: 'El ID del paciente debe ser un número'})
    @Type(() => Number)
    patient_id?: number;

    @IsOptional()
    search?: string;

    @IsOptional()
    @Transform(({ value }) => value.toUpperCase())
    @IsEnum(AppointmentStatus, {message: `El estatus debe ser de: ${Object.values(AppointmentStatus)}`})
    status?: AppointmentStatus
}