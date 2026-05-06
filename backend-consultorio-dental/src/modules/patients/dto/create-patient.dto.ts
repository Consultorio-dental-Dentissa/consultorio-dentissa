import { 
    IsDateString, 
    IsNotEmpty, 
    IsDefined, 
    IsString, 
    IsNumber, 
    IsOptional, 
} from 'class-validator'

export class CreatePatientDto {

    @IsDefined({ message: 'La dirección es requerida' })
    @IsNotEmpty({ message: 'La dirección es requerida' })
    @IsString({ message: "La dirección debe ser un texto plato" })
    address!: string;

    @IsDefined({ message: 'La fecha de nacimiento es requerida' })
    @IsNotEmpty({ message: 'La fecha de nacimiento es requerida' })
    @IsDateString({}, { message: 'La fecha de nacimiento no es válida' })
    birth_date!: string;

    @IsDefined({ message: 'El telefono de emergencia es requerido' })
    @IsNotEmpty({ message: 'El telefono de emergencia es requerido' })
    @IsString({ message: "El telefono debe ser un texto plano" })
    emergency_phone!: string;

    /**
     * INDICACIÓN:
     * El USER_ID se asigna en el servicio. 
     * No debe venir incluido en los datos de entrada
     */
    @IsNumber({}, { message: "El user_id debe ser un número" })
    @IsOptional()
    user_id?: number;
}