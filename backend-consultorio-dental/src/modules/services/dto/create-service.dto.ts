import { 
    IsNotEmpty, 
    IsString, 
    Min, 
    IsNumber, 
    IsInt, 
    IsDefined 
} from 'class-validator'

export class CreateServiceDto {

    @IsDefined({ message: 'El nombre del servicio es requerido' })
    @IsNotEmpty({ message: 'El nombre del servicio es requerido' })
    @IsString({ message: 'El nombre del servicio debe ser un texto plano' })
    name!: string;

    @IsDefined({ message: 'La duración del servicio es requerida' })
    @IsNotEmpty({ message: 'La duración del servicio es requerida' })
    @IsInt({ message: 'La duración del servicio debe ser un número entero' })
    durationMinutes!: number;

    @IsDefined({ message: 'La descripción del servicio es requerida' })
    @IsNotEmpty({ message: 'La descripción del servicio es requerida' })
    @IsString({ message: "La descripción del servicio debe ser un texto plano" })
    description!: string;

    @IsDefined({ message: 'El precio del servicio es requerido' })
    @IsNotEmpty({ message: 'El precio del servicio es requerido' })
    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El precio debe ser un número válido' })
    @Min(0, { message: 'El precio no puede ser un número negativo' })
    price!: number;
}



