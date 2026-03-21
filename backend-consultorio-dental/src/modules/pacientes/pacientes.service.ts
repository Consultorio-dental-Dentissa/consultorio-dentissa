import { Injectable } from '@nestjs/common';
import { RepositorioPaciente } from './repositories/pacientes.repository';

@Injectable()
export class PacientesService {

    constructor(private repositorioPaciente: RepositorioPaciente) {}

    async obtenerPacientes() {
        return await this.repositorioPaciente.obtenerTodos();
    }

}
