import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/infrastructure/prisma/prisma.service";
import { CreateConsultationDto } from "../dto/create-consultation.dto";
import { UpdateConsultationDto } from "../dto/update-consultation.dto";

const CONSULTATION_SELECT = {
    id: true,
    notes: true,
    observations: true,
    created_at: true,
    appointment_id: true,
    appointment: {
        select: {
            scheduled_at: true,
            patient: {
                select: {
                    user: {
                        select: {
                            name: true,
                            lastname: true
                        }
                    }
                }
            },
            service: {
                select: {
                    name: true
                }
            }
        }
    }
} as const;

@Injectable()
export class ConsultationsRepository {

    constructor(private prisma: PrismaService) { }

    async getAll() {
        return await this.prisma.consultation.findMany({
            orderBy: { created_at: 'desc' },
            select: CONSULTATION_SELECT
        });
    }

    async create(createConsultationDto: CreateConsultationDto) {
        return await this.prisma.consultation.create({
            data: {
                notes: createConsultationDto.notes,
                observations: createConsultationDto.observations,
                appointment_id: createConsultationDto.appointment_id,
            },
            select: CONSULTATION_SELECT
        });
    }

    async existsByAppointmentId(appointmentId: number) {
        return await this.prisma.consultation.count({
            where: {
                appointment_id: appointmentId
            }
        }) > 0;
    }

    async existsById(id: number) {
        return await this.prisma.consultation.count({
            where: {
                id: id
            }
        }) > 0;
    }

    async update(id: number, updateConsultationDto: UpdateConsultationDto) {
        return await this.prisma.consultation.update({
            where: {
                id: id
            },
            data: {
                notes: updateConsultationDto.notes,
                observations: updateConsultationDto.observations,
            },
            select: CONSULTATION_SELECT
        });
    }
}
