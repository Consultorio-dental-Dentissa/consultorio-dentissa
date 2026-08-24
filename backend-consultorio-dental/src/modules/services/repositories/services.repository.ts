import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/infrastructure/prisma/prisma.service";
import { CreateServiceDto } from "../dto/create-service.dto";
import { GetServicesDto } from "../dto/get-services.dto";

@Injectable()
export class ServicesRepository {

    constructor(private prisma: PrismaService) { }

    async getAll(filters?: GetServicesDto) {

        /**
         * INDICACIÓN:
         * "price" es un campo Decimal, no un texto, así que no
         * se puede buscar con "contains" como el resto de los
         * campos. Si lo que se escribió en la búsqueda es un
         * número válido, además de buscar por nombre, se
         * agrega una comparación exacta contra el precio.
         */
        const searchAsPrice = filters?.search ? Number(filters.search) : NaN;

        return await this.prisma.service.findMany({
            where: {
                status: filters?.status,
                OR: filters?.search ? [
                    { name: { contains: filters.search, mode: 'insensitive' } },
                    ...(Number.isNaN(searchAsPrice) ? [] : [{ price: searchAsPrice }])
                ] : undefined
            }
        });
    }

    async existByName(name: string) {
        return await this.prisma.service.findFirst({
            where: {
                name: name
            }
        });
    }

    async create(createServiceDto: CreateServiceDto) {
        return await this.prisma.service.create({
            data: {
                name: createServiceDto.name,
                durationMinutes: createServiceDto.durationMinutes,
                price: createServiceDto.price,
                description: createServiceDto.description
            }
        })
    }

    async delete(id: number) {
        const service = await this.prisma.service.delete({
            where: {
                id: id
            }
        });

        return service ? true : false;
    }

    async updateStatus(id: number, status: boolean) {
        const service = await this.prisma.service.update({
            where: {
                id: id
            },
            data: {
                status: status
            }
        });

        return service ? true : false;
    }

    async exitstById(id: number) {
        return await this.prisma.service.count({
            where: {
                id: id
            }
        }) > 0 ? true : false;
    }

    async getById(id: number) {
        return await this.prisma.service.findUnique({
            where: {
                id: id
            }
        });
    }
}