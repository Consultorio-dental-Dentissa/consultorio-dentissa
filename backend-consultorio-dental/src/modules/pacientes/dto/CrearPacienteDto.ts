// crear-paciente.dto.ts
import { IsDateString, IsNotEmpty, IsString, IsNumber, IsOptional, isNotEmpty } from 'class-validator'

export class CrearPacienteDto {
    @IsString()
    @IsNotEmpty({ message: 'La dirección es requerida' })
    direccion!: string          // si llega "dureccion", whitelist lo elimina
    // y direccion queda undefined → error claro

    @IsDateString({}, { message: 'La fecha de nacimiento no es válida' })
    fecha_nacimiento!: string

    @IsNotEmpty({ message: 'El telefono de emergencia es requerido' })
    @IsString({})
    telefono_emergencia!: string

    @IsNumber()
    @IsOptional()
    usuario_id?: number        // se asigna en el servicio, no viene del cliente
}