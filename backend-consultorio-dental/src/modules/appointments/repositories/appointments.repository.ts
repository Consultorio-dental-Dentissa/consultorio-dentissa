import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/infrastructure/prisma/prisma.service";
import { CreateAppointmentDto } from "../dto/create-appointment.dto";
import { GetAppointmentsDto } from "../dto/get-appointment.dto";

@Injectable()
export class AppointmentsRepository {

    constructor(private prisma: PrismaService) { }

    async getAll(filters: GetAppointmentsDto) {

        return await this.prisma.appointment.findMany({
            where: {
                patient_id: filters.patient_id,
                status: filters.status,
                OR: filters.search ? [
                    { patient: { user: { name: { contains: filters.search, mode: 'insensitive' } } } },
                    { patient: { user: { lastname: { contains: filters.search, mode: 'insensitive' } } } },
                    { service: { name: { contains: filters.search, mode: 'insensitive' } } },
                ] : undefined
            },
            select: {
                id: true,
                scheduled_at: true,
                durationMinutes: true,
                status: true,
                created_at: true,
                notes: true,
                service: {
                    select: {
                        name: true
                    }
                },
                patient: {
                    select: {
                        user: {
                            select: {
                                name: true,
                                lastname: true
                            }
                        }
                    }
                }
            }
        });
    }

    async getById(id: number) {
        return await this.prisma.appointment.findFirst({
            where: {
                id: id
            }
        });
    }

    async create(createAppointmentDto: CreateAppointmentDto) {
        return await this.prisma.appointment.create({
            data: {
                scheduled_at: createAppointmentDto.scheduled_at,
                notes: createAppointmentDto.notes,
                patient_id: createAppointmentDto.patient_id,
                service_id: createAppointmentDto.service_id,
                durationMinutes: createAppointmentDto.durationMinutes
            },
            select: {
                id: true,
                scheduled_at: true,
                status: true,
                durationMinutes: true,
                created_at: true,
                notes: true,
                service: {
                    select: {
                        name: true
                    }
                },
                patient: {
                    select: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                lastname: true
                            }
                        }
                    }
                }
            }
        })
    }

    async getAppointmentsByDate(date: Date, excluirCitaId?: number) {
        
        const startOfDay = new Date(date);
        const endOfDay = new Date(date);

        startOfDay.setHours(0, 0, 0, 0);
        endOfDay.setHours(23, 59, 59, 999);

        const appointmments = await this.prisma.appointment.findMany({
            where: {
                scheduled_at: {
                    gte: startOfDay,
                    lt: endOfDay,
                },
                id: excluirCitaId ? { not: excluirCitaId } : undefined,
            },
            select: {
                scheduled_at: true,
                service: {
                    select: {
                        durationMinutes: true
                    }
                }
            }
        });

        return appointmments.map(a => ({
            scheduled_at: a.scheduled_at,
            durationMinutes: a.service.durationMinutes
        }))
    }
}