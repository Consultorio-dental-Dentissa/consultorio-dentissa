import { Injectable } from '@nestjs/common';
import { PatientsRepository } from './repositories/patients.repository';

@Injectable()
export class PatientsService {

    constructor(private patientsRepository: PatientsRepository) {}

    async getAllPatients() {
        return await this.patientsRepository.getAll();
    }

    async getPatientById(id: number) {
        return await this.patientsRepository.getById(id);
    }

}
