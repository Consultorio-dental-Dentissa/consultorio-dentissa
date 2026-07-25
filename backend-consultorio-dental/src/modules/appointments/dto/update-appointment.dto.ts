import {
    IsDefined,
    IsString,
    IsNotEmpty,
    IsDate,
    MaxLength,
    IsInt,
    IsEnum,
    ValidateIf,
} from 'class-validator'

import { Type } from 'class-transformer';
import { AppointmentStatus } from '@prisma/client';

export class UpdateAppointmentDto {

    @IsDefined({ message: "La fecha de la cita es requerida" })
    @IsNotEmpty({ message: "La fecha de la cita es requerida" })
    @IsDate({ message: "La fecha de la cita no es valida" })
    @Type(() => Date)
    scheduled_at!: Date;

    @IsDefined({ message: "La nota de la cita es requerida" })
    @IsNotEmpty({ message: "La nota de la cita es requerida" })
    @IsString({ message: "La nota debe ser un texto plano" })
    @MaxLength(300, { message: "La nota de la cita debe tener maximo 300 caracteres" })
    notes!: string;

    @IsDefined({ message: "El paciente es requerido" })
    @IsNotEmpty({ message: "El paciente es requerido" })
    @IsInt({ message: "El ID del paciente debe ser un número entero" })
    patient_id!: number;

    @IsDefined({ message: "El servicio es requerido" })
    @IsNotEmpty({ message: "El servicio es requerido" })
    @IsInt({ message: "El ID del servicio debe ser un número entero" })
    service_id!: number;

    @IsDefined({ message: "El estatus es requerido" })
    @IsEnum(AppointmentStatus, { message: `El estatus debe ser uno de: ${Object.values(AppointmentStatus)}` })
    status!: AppointmentStatus;

    /**
     * INDICACIÓN:
     * El motivo solo es obligatorio si la cita se está cancelando
     * o reprogramando (RF-013). Para cualquier otro estatus, es opcional.
     */
    @ValidateIf(dto => dto.status === AppointmentStatus.CANCELADA || dto.status === AppointmentStatus.REPROGRAMADA)
    @IsDefined({ message: "Debes escribir un motivo para cancelar o reprogramar la cita" })
    @IsNotEmpty({ message: "Debes escribir un motivo para cancelar o reprogramar la cita" })
    @IsString({ message: "El motivo debe ser un texto plano" })
    @MaxLength(200, { message: "El motivo debe tener maximo 200 caracteres" })
    reason?: string;
}