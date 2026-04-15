import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/infrastructure/prisma/prisma.service";
import { CreatePatientDto } from "../dto/create-patient.dto";
import { Prisma } from '@prisma/client';


@Injectable()
export class PatientsRepository {

    constructor(private prisma: PrismaService) { }

    async getAll() {
        return await this.prisma.patient.findMany({
            select: {
                id: true,
                address: true,
                birth_date: true,
                emergency_phone: true,
                user: {
                    select: {
                        name: true,
                        lastname: true,
                        email: true,
                        phone: true
                    }
                }
            }
        });
    }

    async getById(id: number) {
        return await this.prisma.patient.findUnique({
            where: {
                id: id
            },
            select: {
                id: true,
                address: true,
                birth_date: true,
                emergency_phone: true,
                user: {
                    select: {
                        name: true,
                        lastname: true,
                        email: true,
                        phone: true
                    }
                }
            }
        });
    }

    async create(createPatientDto: CreatePatientDto, transaction?: Prisma.TransactionClient) {

        const client = transaction ?? this.prisma;

        return await client.patient.create({
            data: {
                address: createPatientDto.address,
                birth_date: new Date(createPatientDto.birth_date),
                emergency_phone: createPatientDto.emergency_phone,
                user_id: createPatientDto.user_id!
            }
        });
    }

    async existById(id: number) {
        return await this.prisma.patient.count({
            where: {
                id: id
            }
        }) > 0 ? true : false;
    }
}