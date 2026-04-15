import { IsNotEmpty, IsString, Min, IsNumber, IsInt, IsDefined } from 'class-validator'
import { Type } from 'class-transformer'

export class CreateServiceDto {

    @IsNotEmpty({ message: 'El nombre del servicio es requerido' })
    @IsString()
    name!: string

    @IsDefined({ message: 'La duración del servicio es requerida' })
    @IsNumber({}, { message: 'La duracion debe ser un número' })
    @IsInt({ message: 'La duración en minutos debe ser un número entero' })
    durationMinutes!: number

    @IsNotEmpty({ message: 'La descripción del servicio es requerida' })
    @IsString()
    description!: string

    @IsNotEmpty({ message: 'El precio es requerido' })
    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El precio debe ser un número válido' })
    @Min(0, { message: 'El precio no puede ser negativo' })
    price!: number
}



