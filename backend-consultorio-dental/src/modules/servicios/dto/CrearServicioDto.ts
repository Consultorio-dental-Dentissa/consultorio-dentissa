import { Type } from 'class-transformer';

export class CrearServicioDto {
    nombre: string;
    duracion_minutos: number;
    duracion_horas: string;
    descripcion: string;

    @Type(() => Number)
    precio: number;
}