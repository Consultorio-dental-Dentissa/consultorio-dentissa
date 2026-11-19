import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

@Injectable()
export class PasswordResetTokensRepository {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: number,
    tokenHash: string,
    expiresAt: Date,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;

    return await client.passwordResetToken.create({
      data: { user_id: userId, token_hash: tokenHash, expires_at: expiresAt },
    });
  }

  /** Invalida (marca como usados) los tokens vigentes previos del usuario. */
  async invalidateAllForUser(userId: number, tx?: Prisma.TransactionClient) {
    const client = tx ?? this.prisma;

    return await client.passwordResetToken.updateMany({
      where: { user_id: userId, used_at: null },
      data: { used_at: new Date() },
    });
  }

  async findByHash(tokenHash: string, tx?: Prisma.TransactionClient) {
    const client = tx ?? this.prisma;

    return await client.passwordResetToken.findUnique({
      where: { token_hash: tokenHash },
    });
  }

  /**
   * Consume el token de forma atomica solo si sigue vigente (no usado ni vencido).
   * Devuelve true unicamente para la peticion que lo consumio (un solo uso).
   */
  async consumeIfValid(
    id: number,
    tx?: Prisma.TransactionClient,
  ): Promise<boolean> {
    const client = tx ?? this.prisma;

    const result = await client.passwordResetToken.updateMany({
      where: { id, used_at: null, expires_at: { gt: new Date() } },
      data: { used_at: new Date() },
    });

    return result.count === 1;
  }
}
