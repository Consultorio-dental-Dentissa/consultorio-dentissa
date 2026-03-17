import { crearPacienteDto } from "src/modules/pacientes/dto/crearPacienteDto";

export interface RegistrarUsuarioDto {
    nombre: string;
    apellido: string;
    correo: string;
    contraseña: string;
    telefono: string;
    rol: string;
    paciente: crearPacienteDto
}