import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/infrastructure/prisma/prisma.service";
import { CreateServiceDto } from "../dto/create-service.dto";

@Injectable()
export class ServicesRepository {

    constructor(private prisma: PrismaService) { }

    async getAll() {
        return await this.prisma.service.findMany();
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