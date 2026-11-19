import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

@Injectable()
export class CredentialsRepository {
  constructor(private prisma: PrismaService) {}

  /** Usuario actual sin contraseña, con rol y id de paciente si aplica. */
  async findProfileById(id: number) {
    return await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        lastname: true,
        email: true,
        phone: true,
        status: true,
        created_at: true,
        role: { select: { role: true } },
        patient: { select: { id: true } },
      },
    });
  }

  async findWithPasswordById(id: number, tx?: Prisma.TransactionClient) {
    const client = tx ?? this.prisma;

    return await client.user.findUnique({
      where: { id },
      select: { id: true, status: true, password: true },
    });
  }

  /** Busqueda case-insensitive: hay cuentas antiguas con mayusculas en el correo. */
  async findByEmail(email: string) {
    return await this.prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
      select: { id: true, name: true, email: true, status: true },
    });
  }

  /** Bloquea la fila del usuario hasta el fin de la transaccion (serializa operaciones por usuario). */
  async lockUserById(id: number, tx: Prisma.TransactionClient) {
    await tx.$queryRaw`SELECT id FROM users WHERE id = ${id} FOR UPDATE`;
  }

  /** Guarda el hash nuevo y marca password_changed_at (invalida access tokens previos). */
  async updatePassword(
    id: number,
    passwordHash: string,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;

    await client.user.update({
      where: { id },
      data: { password: passwordHash, password_changed_at: new Date() },
      select: { id: true },
    });
  }
}
