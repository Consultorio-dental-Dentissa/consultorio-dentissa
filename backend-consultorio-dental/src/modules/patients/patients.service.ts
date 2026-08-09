import { Injectable, NotFoundException } from '@nestjs/common';
import { PatientsRepository } from './repositories/patients.repository';

@Injectable()
export class PatientsService {

    constructor(private patientsRepository: PatientsRepository) { }

    async getAllPatients() {
        return await this.patientsRepository.getAll();
    }

    async getPatientById(id: number) {

        const patient = await this.patientsRepository.getById(id);
        
        if (!patient) {
            throw new NotFoundException('El paciente que solicitaste no existe');
        }

        return patient;
    }
}
