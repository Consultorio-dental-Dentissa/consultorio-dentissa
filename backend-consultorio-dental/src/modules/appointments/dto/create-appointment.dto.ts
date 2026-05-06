import {
    IsDefined, 
    IsOptional, 
    IsString,
    IsNotEmpty, 
    IsDateString,
    MinDate,
    MaxLength,
    IsInt
} from 'class-validator'

export class CreateAppointmentDto {

    @IsDefined({ message: "La fecha de la cita es requerida" })
    @IsNotEmpty({ message: "La fecha de la cita es requerida" })
    @IsDateString({}, { message: "La fecha de la cita no es valida" })
    // @MinDate(new Date(), { message: "La fecha de la cita no puede ser anterior a la fecha y hora actual" })
    date!: string;

    /**
     * RECORDATORIO: 
     * Manejar la hora de la cita con algun objeto
     * o validación de hora en lugar de string
     */
    @IsDefined({ message: "La hora de la cita es requerida" })
    @IsNotEmpty({ message: "La hora de la cita es requerida" })
    @IsString({ message: "La hora debe ser un texto plano" })
    time!: string;

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

    @IsOptional()
    reason!: string;

    /**
     * INDICACIÓN:
     * El estatus se adigna automaticamente en la
     * base de datos al momento de ingresar el registro
     */
    @IsOptional()
    status!: string;

    /**
     * INDICACION:
     * La duración total de la cita se asigna en
     * el service al momento de crearla. No debe venir incluida
     */
    @IsOptional()
    durationMinutes!: number; 
}