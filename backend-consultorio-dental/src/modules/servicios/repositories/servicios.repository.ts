import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/infrastructure/prisma/prisma.service";
import { CrearServicioDto } from "../dto/CrearServicioDto";

@Injectable()
export class RepositorioServicios {

    constructor(private prisma: PrismaService) {}

    async obtenerTodos() {
        return await this.prisma.servicio.findMany();
    }

    async existeServicioPorNombre(nombre: string) {
        return await this.prisma.servicio.findFirst({
            where: {
                nombre: nombre
            }
        });
    }

    async crear(crearServicioDto: CrearServicioDto) {
        return await this.prisma.servicio.create({
            data: {
                nombre: crearServicioDto.nombre,
                duracion_minutos: crearServicioDto.duracion_minutos,
                precio: crearServicioDto.precio,
                descripcion: crearServicioDto.descripcion
            }
        })
    }

    async eliminar(id: number) {
        const servicio = await this.prisma.servicio.delete({
            where: {
                id: id
            }
        });

        return servicio ? true : false;
    }

    async cambiarEstado(id: number, estado: boolean) {
        const servicio = await this.prisma.servicio.update({
            where: {
                id: id
            },
            data: {
                activo: estado
            }
        });

        return servicio ? true : false;
    }

    async existeServicioPorId(id: number) {
        return await this.prisma.servicio.count({
            where: {
                id: id
            }
        }) > 0 ? true : false;
    }

    async obtenerServicioPorId(id: number) {
        return await this.prisma.servicio.findUnique({
            where: {
                id: id
            }
        });
    }
}