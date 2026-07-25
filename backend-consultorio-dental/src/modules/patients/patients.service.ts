import { Injectable } from '@nestjs/common';
import { PatientsRepository } from './repositories/patients.repository';
import { GetPatientsDto } from './dto/get-patient.dto';

@Injectable()
export class PatientsService {

    constructor(private patientsRepository: PatientsRepository) {}

    async getAllPatients(filters: GetPatientsDto) {
        return await this.patientsRepository.getAll(filters);
    }

    async getPatientsCount(filters: GetPatientsDto) {
        return await this.patientsRepository.count(filters);
    }

    async getPatientById(id: number) {
        return await this.patientsRepository.getById(id);
    }

}
