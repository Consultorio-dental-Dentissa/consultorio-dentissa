import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

/**
 * Limita por usuario autenticado (request.user lo adjunta AuthGuard, que debe
 * ir antes en @UseGuards); cae a la IP si no hay usuario.
 */
@Injectable()
export class UserThrottlerGuard extends ThrottlerGuard {
  protected getTracker(req: Record<string, unknown>): Promise<string> {
    const userId = (req.user as { id?: number } | undefined)?.id;

    return Promise.resolve(userId ? `user-${userId}` : String(req.ip));
  }
}
