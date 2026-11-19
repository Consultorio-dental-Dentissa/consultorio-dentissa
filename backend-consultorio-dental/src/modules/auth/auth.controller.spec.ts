import 'reflect-metadata';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthController } from './auth.controller';
import { UserThrottlerGuard } from '../../infrastructure/security/guards/user-throttler.guard';

const guardsOf = (handler: unknown) =>
  Reflect.getMetadata('__guards__', handler as object) as unknown[];

describe('AuthController - rate limit', () => {
  it('PATCH /auth/password: 5/min por usuario', () => {
    const handler = AuthController.prototype.changePassword;
    expect(guardsOf(handler)).toContain(UserThrottlerGuard);
    expect(Reflect.getMetadata('THROTTLER:LIMITdefault', handler)).toBe(5);
    expect(Reflect.getMetadata('THROTTLER:TTLdefault', handler)).toBe(60000);
  });

  it('POST /auth/refresh: 30/min', () => {
    const handler = AuthController.prototype.refresh;
    expect(guardsOf(handler)).toContain(ThrottlerGuard);
    expect(Reflect.getMetadata('THROTTLER:LIMITdefault', handler)).toBe(30);
  });

  it('UserThrottlerGuard usa el id de usuario como tracker y la IP si no hay usuario', async () => {
    const guard: any = Object.create(UserThrottlerGuard.prototype);
    await expect(
      guard.getTracker({ user: { id: 9 }, ip: '1.1.1.1' }),
    ).resolves.toBe('user-9');
    await expect(guard.getTracker({ ip: '1.1.1.1' })).resolves.toBe('1.1.1.1');
  });
});
