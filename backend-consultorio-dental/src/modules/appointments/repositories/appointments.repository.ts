import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/infrastructure/prisma/prisma.service";
import { CreateAppointmentDto } from "../dto/create-appointment.dto";

@Injectable()
export class AppointmentsRepository {

    constructor(private prisma: PrismaService) { }

    async getAll() {
        return await this.prisma.appointment.findMany({
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
                date: new Date(crearCitaDto.date),
                time: crearCitaDto.time,
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

        return await this.prisma.appointment.findMany({
            where: {
                date: {
                    gte: new Date(date.setHours(0, 0, 0, 0)),
                    lt: new Date(date.setHours(23, 59, 59, 999)),
                },
                id: excluirCitaId ? { not: excluirCitaId } : undefined,
            },
            select: {
                time: true,
                durationMinutes: true,
            }


        })
    }
}