import { Paciente } from "@prisma/client";

export interface crearPacienteDto {
    direccion: string;
    fecha_nacimiento: Date;
    telefono_emergencia?: string;
    usuario_id: number
}