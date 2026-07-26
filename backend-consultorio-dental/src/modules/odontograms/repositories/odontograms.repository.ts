import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/infrastructure/prisma/prisma.service";
import { Prisma } from "@prisma/client";
import { UpdateToothDto } from "../dto/update-tooth.dto";

const TOTAL_TEETH = 32;

@Injectable()
export class OdontogramsRepository {

    constructor(private prisma: PrismaService) { }

    async createForPatient(patientId: number, transaction?: Prisma.TransactionClient) {

        const client = transaction ?? this.prisma;

        return await client.odontogram.create({
            data: {
                patient_id: patientId,
                teeth: {
                    create: Array.from({ length: TOTAL_TEETH }, (_, index) => ({ number: index + 1 })),
                },
            },
        });
    }

    async getByPatientId(patientId: number) {
        return await this.prisma.odontogram.findUnique({
            where: { patient_id: patientId },
            include: {
                teeth: {
                    orderBy: { number: 'asc' },
                },
            },
        });
    }

    async getToothById(id: number) {
        return await this.prisma.tooth.findUnique({
            where: { id },
        });
    }

    async updateTooth(id: number, updateToothDto: UpdateToothDto) {
        return await this.prisma.tooth.update({
            where: { id },
            data: {
                status: updateToothDto.status,
                note: updateToothDto.note,
            },
        });
    }
}
