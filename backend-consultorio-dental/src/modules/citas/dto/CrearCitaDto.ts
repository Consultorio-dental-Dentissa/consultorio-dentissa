export interface CrearCitaDto {
    fecha: string;
    hora: string;
    duracion_minutos: number;
    estado?: string;
    nota_previa: string;
    motivo: string;
    paciente_id: number;
    servicio_id: number;
}