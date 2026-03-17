import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/infrastructure/prisma/prisma.service";
import { crearPacienteDto } from "../dto/crearPacienteDto";
import { Prisma } from '@prisma/client';


@Injectable()
export class RepositorioPaciente {

    constructor(private prisma: PrismaService) {}


    async obtenerTodos() {
        return await this.prisma.paciente.findMany();
    }


    async obtenerPacientePorId(id: number) {
        return await this.prisma.paciente.findUnique({
            where: {
                id: id
            }
        });
    }


    async crearPaciente(crearPacienteDto : crearPacienteDto, transaction? : Prisma.TransactionClient) {

        const cliente = transaction ?? this.prisma;

        return await cliente.paciente.create({
            data: {
                direccion: crearPacienteDto.direccion,
                fecha_nacimiento: new Date(crearPacienteDto.fecha_nacimiento),
                telefono_emergencia: crearPacienteDto.telefono_emergencia,
                usuario_id: crearPacienteDto.usuario_id
            }
        });
    }


}