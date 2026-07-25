import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/infrastructure/prisma/prisma.service";
import { CreateAppointmentDto } from "../dto/create-appointment.dto";
import { UpdateAppointmentDto } from "../dto/update-appointment.dto";
import { GetAppointmentsDto } from "../dto/get-appointment.dto";
import { AppointmentStatus, Prisma } from "@prisma/client";

@Injectable()
export class AppointmentsRepository {

    constructor(private prisma: PrismaService) { }


    private buildWhere(filters: GetAppointmentsDto): Prisma.AppointmentWhereInput {
        const where: Prisma.AppointmentWhereInput = {
            patient_id: filters.patient_id,
            status: filters.status,
        };

        if (filters.date) {
            const [year, month, day] = filters.date.split('-').map(Number);
            const start = new Date(year, month - 1, day, 0, 0, 0, 0);
            const end = new Date(year, month - 1, day, 23, 59, 59, 999);
            where.scheduled_at = { gte: start, lte: end };
        }

        return where;
    }

    async count(filters: GetAppointmentsDto) {
        return this.prisma.appointment.count({ where: this.buildWhere(filters) });
    }

    async getAll(filters: GetAppointmentsDto) {

        return await this.prisma.appointment.findMany({
            where: this.buildWhere(filters),
            select: {
                id: true,
                scheduled_at: true,
                durationMinutes: true,
                status: true,
                created_at: true,
                notes: true,
                patient_id: true,
                service_id: true,
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

    async getAppointmentsByDate(date: Date, excludeAppointmentId?: number) {

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
                id: excludeAppointmentId ? { not: excludeAppointmentId } : undefined,
                /**
                 * INDICACIÓN (RF-012):
                 * Las citas canceladas no ocupan horario, por lo que
                 * no deben tomarse en cuenta al validar choques de horario.
                 */
                status: { not: AppointmentStatus.CANCELADA },
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

    async update(id: number, updateAppointmentDto: UpdateAppointmentDto & { durationMinutes: number }) {
        return await this.prisma.appointment.update({
            where: {
                id: id
            },
            data: {
                scheduled_at: updateAppointmentDto.scheduled_at,
                notes: updateAppointmentDto.notes,
                patient_id: updateAppointmentDto.patient_id,
                service_id: updateAppointmentDto.service_id,
                status: updateAppointmentDto.status,
                reason: updateAppointmentDto.reason,
                durationMinutes: updateAppointmentDto.durationMinutes,
            },
            select: {
                id: true,
                scheduled_at: true,
                status: true,
                durationMinutes: true,
                created_at: true,
                notes: true,
                patient_id: true,
                service_id: true,
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
}