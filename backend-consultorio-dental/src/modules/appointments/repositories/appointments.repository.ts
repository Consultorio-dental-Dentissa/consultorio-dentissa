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
                status: filters.status
            },
            select: {
                id: true,
                date: true,
                time: true,
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

    async create(crearCitaDto: CreateAppointmentDto) {
        return await this.prisma.appointment.create({
            data: {
                date: crearCitaDto.scheduled_at,
                time: '',
                notes: crearCitaDto.notes,
                patient_id: crearCitaDto.patient_id,
                service_id: crearCitaDto.service_id,
                durationMinutes: crearCitaDto.durationMinutes
            },
            select: {
                id: true,
                date: true,
                time: true,
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
                date: {
                    gte: startOfDay,
                    lt: endOfDay,
                },
                id: excluirCitaId ? { not: excluirCitaId } : undefined,
            },
            select: {
                date: true,
                service: {
                    select: {
                        durationMinutes: true
                    }
                }
            }
        });

        return appointmments.map(a => ({
            date: a.date,
            durationMinutes: a.service.durationMinutes
        }))
    }
}