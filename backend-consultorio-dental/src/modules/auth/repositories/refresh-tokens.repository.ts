import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

@Injectable()
export class RefreshTokensRepository {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: number,
    tokenHash: string,
    expiresAt: Date,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;

    return await client.refreshToken.create({
      data: {
        user_id: userId,
        token_hash: tokenHash,
        expires_at: expiresAt,
      },
    });
  }

  /** Busca por hash sin filtrar revocacion ni vencimiento (para detectar reutilizacion). */
  async findByHash(tokenHash: string) {
    return await this.prisma.refreshToken.findUnique({
      where: { token_hash: tokenHash },
    });
  }

  async findValidByHash(tokenHash: string) {
    return await this.prisma.refreshToken.findFirst({
      where: {
        token_hash: tokenHash,
        revoked_at: null,
        expires_at: { gt: new Date() },
      },
    });
  }

  /**
   * Revoca el token solo si sigue vigente (no revocado ni vencido). Es una
   * operacion atomica: devuelve true unicamente para la peticion que logro
   * revocarlo, de modo que dos refresh concurrentes no puedan usar el mismo token.
   */
  async revokeIfValid(
    id: number,
    tx?: Prisma.TransactionClient,
  ): Promise<boolean> {
    const client = tx ?? this.prisma;

    const result = await client.refreshToken.updateMany({
      where: { id, revoked_at: null, expires_at: { gt: new Date() } },
      data: { revoked_at: new Date() },
    });

    return result.count === 1;
  }

  /** Revoca todos los refresh tokens vigentes del usuario (cierra todas sus sesiones). */
  async revokeAllForUser(userId: number, tx?: Prisma.TransactionClient) {
    const client = tx ?? this.prisma;

    return await client.refreshToken.updateMany({
      where: { user_id: userId, revoked_at: null },
      data: { revoked_at: new Date() },
    });
  }

  async revokeByHash(tokenHash: string) {
    return await this.prisma.refreshToken.updateMany({
      where: { token_hash: tokenHash, revoked_at: null },
      data: { revoked_at: new Date() },
    });
  }
}
