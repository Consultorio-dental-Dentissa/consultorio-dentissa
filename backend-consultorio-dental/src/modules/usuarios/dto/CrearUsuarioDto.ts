import { crearPacienteDto } from "src/modules/pacientes/dto/crearPacienteDto";

export interface CrearUsuarioDto {
    nombre: string;
    apellido: string;
    correo: string;
    contraseña: string;
    telefono: string;
    rol: string;
    paciente?: crearPacienteDto
}