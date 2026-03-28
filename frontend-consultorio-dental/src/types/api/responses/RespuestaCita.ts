export interface RespuestaCita {
    id: number;
    fecha: Date;
    hora: string;
    duracion_minutos: number;
    estado: string;
    created_at: Date;
    paciente: {
        nombre: string
        apellido: string
    },
    servicio: {
        nombre: string
    }
}