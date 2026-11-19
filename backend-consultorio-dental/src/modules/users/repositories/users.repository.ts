import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { GetUsersDto } from '../dto/get-users.dto';
import { resolvePagination } from 'src/infrastructure/common/dto/pagination.dto';
import { Role } from '../enums/rol.enum';

@Injectable()
export class UsersRepository {
  constructor(private prisma: PrismaService) {}

  async getAll(filters?: GetUsersDto) {
    const { skip, take } = resolvePagination(filters);
    const where: Prisma.UserWhereInput = {
      role: filters?.role ? { role: filters.role } : undefined,
      status: filters?.status,
      OR: filters?.search
        ? [
            { name: { contains: filters.search, mode: 'insensitive' } },
            { lastname: { contains: filters.search, mode: 'insensitive' } },
            { email: { contains: filters.search, mode: 'insensitive' } },
            { phone: { contains: filters.search, mode: 'insensitive' } },
          ]
        : undefined,
    };

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy: { id: 'asc' },
        skip,
        take,
        omit: {
          password: true,
          password_changed_at: true,
        },
        include: {
          role: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { items, total };
  }

  async getById(id: number, transaction?: Prisma.TransactionClient) {
    const client = transaction ?? this.prisma;
    return await client.user.findFirst({
      where: {
        id: id,
      },
      omit: {
        password: true,
        password_changed_at: true,
      },
      include: {
        role: true,
      },
    });
  }

  async getByEmail(email: string) {
    return await this.prisma.user.findFirst({
      where: {
        email: { equals: email, mode: 'insensitive' },
      },
    });
  }

  async emailExists(email: string): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: {
        email: { equals: email, mode: 'insensitive' },
      },
    });

    return count > 0;
  }

  async phoneExists(phone: string): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: {
        phone: phone,
      },
    });

    return count > 0;
  }

  async create(
    createUserDto: CreateUserDto,
    transaction?: Prisma.TransactionClient,
  ) {
    const client = transaction ?? this.prisma;

    const rol = await client.role.findFirst({
      where: {
        role: createUserDto.role,
      },
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
        role_id: rol.id,
      },
      select: {
        id: true,
        name: true,
        lastname: true,
        email: true,
        phone: true,
        status: true,
        created_at: true,
        role: {
          select: {
            role: true,
          },
        },
      },
    });
  }

  // Metodo definido para devolver usuario con contraseña
  async getUserByEmailWithPassword(email: string) {
    // Comparacion case-insensitive: hay cuentas antiguas con mayusculas en el correo.
    return await this.prisma.user.findFirst({
      where: {
        email: { equals: email, mode: 'insensitive' },
      },
      omit: {
        password: false,
      },
      include: {
        role: true,
      },
    });
  }

  async updateUserStatus(
    id: number,
    status: boolean,
    transaction?: Prisma.TransactionClient,
  ) {
    const client = transaction ?? this.prisma;
    const user = await client.user.update({
      where: {
        id: id,
      },
      data: {
        status: status,
      },
    });

    return user ? true : false;
  }

  async countActiveAdmins(transaction?: Prisma.TransactionClient) {
    const client = transaction ?? this.prisma;

    return await client.user.count({
      where: { status: true, role: { role: Role.ADMINISTRADOR } },
    });
  }

  async getByIdWithStatus(id: number, transaction?: Prisma.TransactionClient) {
    const client = transaction ?? this.prisma;

    return await client.user.findUnique({
      where: { id },
      select: { id: true, status: true, role: { select: { role: true } } },
    });
  }

  async getStatusByUserId(id: number) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: id,
      },
    });

    return user?.status;
  }

  /** Bloquea la fila del usuario (SELECT ... FOR UPDATE) hasta el fin de la transaccion. */
  async lockById(id: number, tx: Prisma.TransactionClient) {
    await tx.$queryRaw`SELECT id FROM users WHERE id = ${id} FOR UPDATE`;
  }

  async getForUpdate(id: number, tx: Prisma.TransactionClient) {
    return await tx.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        lastname: true,
        email: true,
        phone: true,
        status: true,
        role: { select: { role: true } },
      },
    });
  }

  async isEmailTakenByOther(
    email: string,
    userId: number,
    tx: Prisma.TransactionClient,
  ) {
    return (
      (await tx.user.count({
        where: {
          email: { equals: email, mode: 'insensitive' },
          id: { not: userId },
        },
      })) > 0
    );
  }

  async isPhoneTakenByOther(
    phone: string,
    userId: number,
    tx: Prisma.TransactionClient,
  ) {
    return (await tx.user.count({ where: { phone, id: { not: userId } } })) > 0;
  }

  async findRoleId(role: Role, tx: Prisma.TransactionClient) {
    const found = await tx.role.findFirst({
      where: { role },
      select: { id: true },
    });
    return found?.id ?? null;
  }

  async applyUpdate(
    id: number,
    data: Prisma.UserUncheckedUpdateInput,
    tx: Prisma.TransactionClient,
  ) {
    await tx.user.update({ where: { id }, data });
  }

  /** Cierra todas las sesiones (refresh tokens) del usuario. */
  async revokeRefreshTokens(userId: number, tx: Prisma.TransactionClient) {
    await tx.refreshToken.updateMany({
      where: { user_id: userId, revoked_at: null },
      data: { revoked_at: new Date() },
    });
  }

  /** Invalida los enlaces de recuperacion pendientes. */
  async invalidateResetTokens(userId: number, tx: Prisma.TransactionClient) {
    await tx.passwordResetToken.updateMany({
      where: { user_id: userId, used_at: null },
      data: { used_at: new Date() },
    });
  }

  /** Hash de la contrasena (omitido por defecto). Nunca se devuelve ni se registra. */
  async getPasswordHash(userId: number, tx: Prisma.TransactionClient) {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });
    return user?.password ?? null;
  }
}
