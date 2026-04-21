import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, User } from "@prisma/client";
import { PrismaService } from "src/infrastructure/prisma/prisma.service";
import { CreateUserDto } from '../dto/create-user.dto';

@Injectable()
export class UsersRepository {

    constructor(private prisma: PrismaService) { }

    async getAll() {
        return await this.prisma.user.findMany({
            include: {
                role: true
            }
        });
    }

    async getById(id: number): Promise<User | null> {
        return await this.prisma.user.findFirst({
            where: {
                id: id
            },
            include: {
                role: true
            }
        });
    }

    async getByEmail(email: string): Promise<User | null> {
        return await this.prisma.user.findFirst({
            where: {
                email: email
            }
        });
    }

    async emailExists(email: string): Promise<Boolean> {
        const count = await this.prisma.user.count({
            where: {
                email: email
            }
        });

        return count > 0;
    }

    async phoneExists(phone: string): Promise<Boolean> {
        const count = await this.prisma.user.count({
            where: {
                phone: phone
            }
        });

        return count > 0;
    }

    async create(createUserDto: CreateUserDto, transaction?: Prisma.TransactionClient) {

        const client = transaction ?? this.prisma;

        const rol = await client.role.findFirst({
            where: {
                role: createUserDto.role
            }
        });

        if (!rol) {
            throw new NotFoundException('Rol no encontrado');
        }

        return await client.user.create({
            data: {
                name: createUserDto.name,
                lastname: createUserDto.lastname,
                email: createUserDto.email,
                password: createUserDto.password,
                phone: createUserDto.phone,
                role_id: rol.id
            },
            select: {
                id: true,
                name: true,
                lastname: true,
                email: true,
                phone: true,
                status: true,
                role: {
                    select: {
                        role: true
                    }
                }
            }
        });
    }

    // Metodo definido para devolver usuario con contraseña
    async getUserByEmailWithPassword(email: string) {
        return await this.prisma.user.findUnique({
            where: {
                email: email
            },
            omit: {
                password: false
            },
            include: {
                role: true
            }
        });
    }

    async updateUserStatus(id: number, status: boolean) {
        const user = await this.prisma.user.update({
            where: {
                id: id
            },
            data: {
                status: status
            }
        });

        return user ? true : false;
    }

    async getStatusByUserId(id: number) {
        const user = await this.prisma.user.findFirst({
            where: {
                id: id,
            }
        });

        return user?.status;
    }
}