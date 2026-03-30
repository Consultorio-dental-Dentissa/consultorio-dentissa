import { Rol } from '../enums/rol.enum';
import { CrearPacienteDto } from '../../pacientes/dto/CrearPacienteDto'; // O mejor, otra interfaz

export interface ICrearUsuario {
    nombre: string;
    apellido: string;
    correo: string;
    contraseña: string;
    telefono: string;
    rol: Rol;
    paciente?: CrearPacienteDto;
}
