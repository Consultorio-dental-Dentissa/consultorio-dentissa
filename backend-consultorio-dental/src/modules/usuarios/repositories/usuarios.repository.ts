import { Injectable, NotFoundException } from '@nestjs/common';
import { Usuario } from "@prisma/client";
import { PrismaService } from "src/infrastructure/prisma/prisma.service";
import { CrearUsuarioDto } from '../dto/CrearUsuarioDto';

@Injectable()
export class RepositorioUsuario {

    constructor(private prisma: PrismaService) {}



    async obtenerTodos() {
        return await this.prisma.usuario.findMany();
    }



    
    async obtenerUsuarioPorId(id: number) : Promise<Usuario | null> {
        return await this.prisma.usuario.findFirst({
            where: {
                id: id
            }
        });
    }

    async obtenerUsuarioPorCorreo(correo: string) : Promise<Usuario | null> {
        return await this.prisma.usuario.findFirst({
            where: {
                correo: correo
            }
        });
    }


    async existeCorreo(correo: string) {
        const conteo = await this.prisma.usuario.count({
            where: {
                correo: correo
            }
        });

        return conteo > 0;
    }

    async existeTelefono(telefono: string) {
        const conteo = await this.prisma.usuario.count({
            where: {
                telefono: telefono
            }
        });

        return conteo > 0;
    }


    async crearUsuario(crearUsuarioDto : CrearUsuarioDto) {

        const rol = await this.prisma.rol.findFirst({
            where: {
                rol: crearUsuarioDto.rol
            }
        });

        if (!rol) {
            throw new NotFoundException('Rol no encontrado');
        }

        return await this.prisma.usuario.create({
            data: {
                nombre: crearUsuarioDto.nombre,
                correo: crearUsuarioDto.correo,
                contraseña: crearUsuarioDto.contraseña,
                telefono: crearUsuarioDto.telefono,
                rol: {
                    connect: {id: rol.id}
                }
            },
            select: {
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

    async obtenerUsuarioPorCorreoConContraseña(correo: string) : Promise<Usuario | null> {
        return await this.prisma.usuario.findFirst({
            where: {
                correo: correo
            },
            omit: {
                contraseña: false
            }
        });
    }

}