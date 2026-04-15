import { BadRequestException, Injectable } from '@nestjs/common';
import { ServicesRepository } from './repositories/services.repository';
import { CreateServiceDto } from './dto/create-service.dto';

@Injectable()
export class ServicesService {

    constructor(private servicesRepository: ServicesRepository) { }

    async getAllServices() {
        return this.servicesRepository.getAll();
    }

    async updateServiceStatus(id: number, estado: boolean) {
        return this.servicesRepository.updateStatus(id, estado);
    }

    async createService(createServiceDto: CreateServiceDto) {

        if (createServiceDto.durationMinutes < 15 || createServiceDto.durationMinutes > 120) {
            throw new BadRequestException(
                'El servicio debe durar minimo 15 minutos y maximo 2 horas'
            )
        }

        const isNameUsed = await this.servicesRepository.existByName(createServiceDto.name);

        if (isNameUsed) {
            throw new BadRequestException('Ya existe un servicio con este nombre');
        }

        return this.servicesRepository.create(createServiceDto);
    }
}
