import { IsDateString, IsNotEmpty, IsString, IsNumber, IsOptional, isNotEmpty } from 'class-validator'

export class CreatePatientDto {
    @IsString()
    @IsNotEmpty({ message: 'La dirección es requerida' })
    address!: string          // si llega "dureccion", whitelist lo elimina
    // y direccion queda undefined → error claro

    @IsDateString({}, { message: 'La fecha de nacimiento no es válida' })
    birth_date!: string

    @IsNotEmpty({ message: 'El telefono de emergencia es requerido' })
    @IsString({})
    emergency_phone!: string

    @IsNumber()
    @IsOptional()
    user_id?: number        // se asigna en el servicio, no viene del cliente
}