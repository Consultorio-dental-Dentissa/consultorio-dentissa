import { Injectable } from '@nestjs/common';
import { RepositorioPaciente } from './repositories/pacientes.repository';

@Injectable()
export class PacientesService {

    constructor(private repositorioPaciente: RepositorioPaciente) {}

    async obtenerPacientes() {
        return await this.repositorioPaciente.obtenerTodos();
    }

    async obtenerPacientePorId(id: number) {
        return await this.repositorioPaciente.obtenerPacientePorId(id);
    }

}
