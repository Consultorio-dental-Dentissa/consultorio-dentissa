import { Injectable, NotFoundException } from '@nestjs/common';
import { OdontogramsRepository } from './repositories/odontograms.repository';
import { UpdateToothDto } from './dto/update-tooth.dto';

@Injectable()
export class OdontogramsService {

    constructor(private odontogramsRepository: OdontogramsRepository) { }

    async getOdontogramByPatientId(patientId: number) {

        const odontogram = await this.odontogramsRepository.getByPatientId(patientId);

        if (!odontogram) {
            throw new NotFoundException('El paciente no tiene un odontograma registrado');
        }

        return odontogram;
    }

    async updateTooth(id: number, updateToothDto: UpdateToothDto) {

        const tooth = await this.odontogramsRepository.getToothById(id);

        if (!tooth) {
            throw new NotFoundException('El diente no existe');
        }

        return await this.odontogramsRepository.updateTooth(id, updateToothDto);
    }
}
