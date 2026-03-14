import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Usuario } from "@prisma/client";
import { PrismaService } from "src/infrastructure/prisma/prisma.service";
import { CrearUsuarioDto } from '../dto/CrearUsuarioDto';

@Injectable()
export class RepositorioUsuario {

    constructor(private prisma: PrismaService) { }



    async obtenerTodos() {
        return await this.prisma.usuario.findMany({
            include: {
                rol: true
            }
        });
    }




    async obtenerUsuarioPorId(id: number): Promise<Usuario | null> {

        console.log("3. Pasamos por el repositorio de usuarios");

        return await this.prisma.usuario.findFirst({
            where: {
                id: id
            },
            include: {
                rol: true
            }
        });
    }



    async obtenerUsuarioPorCorreo(correo: string): Promise<Usuario | null> {
        return await this.prisma.usuario.findFirst({
            where: {
                correo: correo
            }
        });
    }


    async existeCorreo(correo: string): Promise<Boolean> {
        const conteo = await this.prisma.usuario.count({
            where: {
                correo: correo
            }
        });

        return conteo > 0;
    }

    async existeTelefono(telefono: string): Promise<Boolean> {
        const conteo = await this.prisma.usuario.count({
            where: {
                telefono: telefono
            }
        });

        return conteo > 0;
    }


    async crearUsuario(crearUsuarioDto: CrearUsuarioDto, transaction? : Prisma.TransactionClient) {

        const cliente = transaction ?? this.prisma;

        const rol = await cliente.rol.findFirst({
            where: {
                rol: crearUsuarioDto.rol
            }
        });

        if (!rol) {
            throw new NotFoundException('Rol no encontrado');
        }

        return await cliente.usuario.create({
            data: {
                nombre: crearUsuarioDto.nombre,
                apellido: crearUsuarioDto.apellido,
                correo: crearUsuarioDto.correo,
                contraseña: crearUsuarioDto.contraseña,
                telefono: crearUsuarioDto.telefono,
                rol_id: rol.id
            },
            select: {
                id: true,
                nombre: true,
                correo: true,
                telefono: true,
                activo: true,
                rol: {
                    select: {
                        rol: true
                    }
                }
            }
        });
    }


    // Metodo definido para devolver usuario con contraseña

    async obtenerUsuarioPorCorreoConContraseña(correo: string) {
        return await this.prisma.usuario.findUnique({
            where: {
                correo: correo
            },
            omit: {
                contraseña: false
            },
            include: {
                rol: true
            }
        });
    }

}