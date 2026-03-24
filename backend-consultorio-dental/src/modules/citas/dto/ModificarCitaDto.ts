export interface ModificarCitaDto {
    id: number;
    motivo: string;
    nota_previa: string;
    estado: string;
    fecha: string;
    hora: string;
    servicio_id: number;
    duracion_minutos: number;
}