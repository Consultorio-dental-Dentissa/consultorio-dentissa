import { Rol } from '../enums/rol.enum';
import { CrearPacienteDto } from '../../pacientes/dto/CrearPacienteDto'; // O mejor, otra interfaz

export interface ICreateUser {
    name: string;
    lastname: string;
    email: string;
    password: string;
    phone: string;
    rol: Rol;
    patient?: CrearPacienteDto;
}
