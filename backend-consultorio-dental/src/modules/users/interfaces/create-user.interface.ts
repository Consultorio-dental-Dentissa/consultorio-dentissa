import { Rol } from '../enums/rol.enum';
import { CreatePatientDto } from '../../patients/dto/create-patient.dto'; // O mejor, otra interfaz

export interface ICreateUser {
    name: string;
    lastname: string;
    email: string;
    password: string;
    phone: string;
    rol: Rol;
    patient?: CreatePatientDto;
}
