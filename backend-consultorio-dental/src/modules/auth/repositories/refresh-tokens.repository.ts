import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

@Injectable()
export class RefreshTokensRepository {

    constructor(private prisma: PrismaService) { }

    async create(userId: number, tokenHash: string, expiresAt: Date) {
        return await this.prisma.refreshToken.create({
            data: {
                user_id: userId,
                token_hash: tokenHash,
                expires_at: expiresAt
            }
        });
    }

    async findValidByHash(tokenHash: string) {
        return await this.prisma.refreshToken.findFirst({
            where: {
                token_hash: tokenHash,
                revoked_at: null,
                expires_at: { gt: new Date() }
            }
        });
    }

    async revoke(id: number) {
        return await this.prisma.refreshToken.update({
            where: { id },
            data: { revoked_at: new Date() }
        });
    }

    async revokeByHash(tokenHash: string) {
        return await this.prisma.refreshToken.updateMany({
            where: { token_hash: tokenHash, revoked_at: null },
            data: { revoked_at: new Date() }
        });
    }
}
