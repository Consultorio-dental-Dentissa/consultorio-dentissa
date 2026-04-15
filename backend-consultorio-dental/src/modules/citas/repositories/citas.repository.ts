import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/infrastructure/prisma/prisma.service";
import { CrearCitaDto } from "../dto/CrearCitaDto";

@Injectable()
export class RepositorioCitas {

    constructor(private prisma: PrismaService) { }

    async obtenerTodos() {
        return await this.prisma.cita.findMany({
            select: {
                id: true,
                fecha: true,
                hora: true,
                duracion_minutos: true,
                estado: true,
                created_at: true,
                servicio: {
                    select: {
                        name: true
                    }
                },
                paciente: {
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

    async obtenerCitaPorId(id: number) {
        return await this.prisma.cita.findFirst({
            where: {
                id: id
            }
        });
    }

    async crear(crearCitaDto: CrearCitaDto) {
        return await this.prisma.cita.create({
            data: {
                fecha: new Date(crearCitaDto.fecha),
                hora: crearCitaDto.hora,
                nota_previa: crearCitaDto.nota_previa,
                paciente_id: crearCitaDto.paciente_id,
                servicio_id: crearCitaDto.servicio_id,
                duracion_minutos: crearCitaDto.duracion_minutos
            },
            select: {
                id: true,
                fecha: true,
                hora: true,
                estado: true,
                duracion_minutos: true,
                created_at: true,
                servicio: {
                    select: {
                        name: true
                    }
                },
                paciente: {
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

    async obtenerCitasPorFecha(fecha: Date, excluirCitaId?: number) {

        return await this.prisma.cita.findMany({
            where: {
                fecha: {
                    gte: new Date(fecha.setHours(0, 0, 0, 0)),
                    lt: new Date(fecha.setHours(23, 59, 59, 999)),
                },
                id: excluirCitaId ? { not: excluirCitaId } : undefined,
            },
            select: {
                hora: true,
                duracion_minutos: true,
            }


        })
    }
}