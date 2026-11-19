import {
  BadRequestException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { AuthService } from './auth.service';

jest.mock('bcrypt', () => {
  const actual = jest.requireActual('bcrypt');
  return { ...actual, hash: jest.fn(actual.hash) };
});

describe('AuthService - cuenta y recuperacion de contrasena', () => {
  const tx = { tx: true };
  let service: AuthService;
  let refreshRepo: any;
  let resetRepo: any;
  let credRepo: any;
  let prisma: any;
  let mail: any;
  let audit: any;

  beforeEach(() => {
    refreshRepo = { revokeAllForUser: jest.fn(), create: jest.fn() };
    resetRepo = {
      create: jest.fn(),
      invalidateAllForUser: jest.fn(),
      findByHash: jest.fn(),
      consumeIfValid: jest.fn(),
    };
    credRepo = {
      findProfileById: jest.fn(),
      findWithPasswordById: jest.fn(),
      findByEmail: jest.fn(),
      updatePassword: jest.fn(),
      lockUserById: jest.fn(),
    };
    prisma = { $transaction: jest.fn((cb: any) => cb(tx)) };
    mail = {
      isConfigured: jest.fn().mockReturnValue(true),
      sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
    };
    audit = { log: jest.fn().mockResolvedValue(undefined) };
    service = new AuthService(
      {} as any,
      {} as any,
      refreshRepo,
      resetRepo,
      credRepo,
      prisma,
      mail,
      audit,
    );
  });

  describe('me', () => {
    it('devuelve el usuario sin password, con rol y patient_id', async () => {
      credRepo.findProfileById.mockResolvedValue({
        id: 1,
        name: 'A',
        lastname: 'B',
        email: 'a@b.c',
        phone: '1',
        status: true,
        created_at: new Date(),
        role: { role: 'PACIENTE' },
        patient: { id: 9 },
      });
      const result: any = await service.me(1);
      expect(result.role).toBe('PACIENTE');
      expect(result.patient_id).toBe(9);
      expect(result).not.toHaveProperty('password');
    });

    it('usuario inactivo o inexistente responde 401', async () => {
      credRepo.findProfileById.mockResolvedValue({ id: 1, status: false });
      await expect(service.me(1)).rejects.toThrow(UnauthorizedException);
      credRepo.findProfileById.mockResolvedValue(null);
      await expect(service.me(1)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('changePassword', () => {
    const current = 'contrasena-actual-1';

    beforeEach(async () => {
      credRepo.findWithPasswordById.mockResolvedValue({
        id: 1,
        status: true,
        password: await bcrypt.hash(current, 4),
      });
    });

    it('rechaza contrasena actual incorrecta', async () => {
      await expect(
        service.changePassword(1, {
          currentPassword: 'incorrecta-123',
          newPassword: 'nueva-contrasena-1',
        }),
      ).rejects.toThrow(BadRequestException);
      expect(credRepo.updatePassword).not.toHaveBeenCalled();
    });

    it('rechaza nueva contrasena igual a la actual', async () => {
      await expect(
        service.changePassword(1, {
          currentPassword: current,
          newPassword: current,
        }),
      ).rejects.toThrow(BadRequestException);
      expect(credRepo.updatePassword).not.toHaveBeenCalled();
    });

    it('exito: guarda hash nuevo y revoca todos los refresh tokens en la misma transaccion', async () => {
      await expect(
        service.changePassword(1, {
          currentPassword: current,
          newPassword: 'nueva-contrasena-1',
        }),
      ).resolves.toEqual({ changed: true });

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      const [id, newHash, usedTx] = credRepo.updatePassword.mock.calls[0];
      expect(id).toBe(1);
      expect(newHash).not.toBe('nueva-contrasena-1');
      await expect(bcrypt.compare('nueva-contrasena-1', newHash)).resolves.toBe(
        true,
      );
      expect(usedTx).toBe(tx);
      expect(refreshRepo.revokeAllForUser).toHaveBeenCalledWith(1, tx);
    });

    it('audita el cambio dentro de la transaccion sin contrasenas ni hashes', async () => {
      await service.changePassword(1, {
        currentPassword: current,
        newPassword: 'nueva-contrasena-1',
      });

      expect(audit.log).toHaveBeenCalledTimes(1);
      const [entry, usedTx] = audit.log.mock.calls[0];
      expect(entry).toEqual({
        userId: 1,
        action: 'PASSWORD_CHANGED',
        entity: 'USER',
        entityId: 1,
      });
      expect(usedTx).toBe(tx);
    });

    it('si la contrasena actual es incorrecta no se audita', async () => {
      await expect(
        service.changePassword(1, {
          currentPassword: 'incorrecta-123',
          newPassword: 'nueva-contrasena-1',
        }),
      ).rejects.toThrow(BadRequestException);
      expect(audit.log).not.toHaveBeenCalled();
    });
  });

  describe('forgotPassword', () => {
    it('sin SMTP responde 503 igual exista o no el correo y no genera tokens', async () => {
      mail.isConfigured.mockReturnValue(false);

      credRepo.findByEmail.mockResolvedValue(null);
      await expect(service.forgotPassword('no@existe.com')).rejects.toThrow(
        ServiceUnavailableException,
      );
      credRepo.findByEmail.mockResolvedValue({
        id: 1,
        name: 'A',
        email: 'si@existe.com',
        status: true,
      });
      await expect(service.forgotPassword('si@existe.com')).rejects.toThrow(
        ServiceUnavailableException,
      );
      expect(resetRepo.create).not.toHaveBeenCalled();
      expect(mail.sendPasswordResetEmail).not.toHaveBeenCalled();
    });

    it('bloquea la fila del usuario dentro de la transaccion antes de invalidar/crear', async () => {
      credRepo.findByEmail.mockResolvedValue({
        id: 1,
        name: 'A',
        email: 'si@existe.com',
        status: true,
      });
      await service.forgotPassword('si@existe.com');
      expect(credRepo.lockUserById).toHaveBeenCalledWith(1, tx);
    });

    it('responde igual exista o no el correo', async () => {
      credRepo.findByEmail.mockResolvedValue(null);
      const missing = await service.forgotPassword('no@existe.com');

      credRepo.findByEmail.mockResolvedValue({
        id: 1,
        name: 'A',
        email: 'si@existe.com',
        status: true,
      });
      const existing = await service.forgotPassword('si@existe.com');

      expect(existing).toEqual(missing);
      expect(mail.sendPasswordResetEmail).toHaveBeenCalledTimes(1);
    });

    it('no genera token ni correo para usuario inexistente o inactivo', async () => {
      credRepo.findByEmail.mockResolvedValue(null);
      await service.forgotPassword('no@existe.com');
      credRepo.findByEmail.mockResolvedValue({
        id: 2,
        name: 'I',
        email: 'i@x.com',
        status: false,
      });
      await service.forgotPassword('i@x.com');

      expect(resetRepo.create).not.toHaveBeenCalled();
      expect(mail.sendPasswordResetEmail).not.toHaveBeenCalled();
    });

    it('guarda solo el hash sha256 (nunca el token en claro), expira en 30 min e invalida previos', async () => {
      credRepo.findByEmail.mockResolvedValue({
        id: 1,
        name: 'A',
        email: 'si@existe.com',
        status: true,
      });
      const before = Date.now();
      await service.forgotPassword('si@existe.com');

      const sentToken: string = mail.sendPasswordResetEmail.mock.calls[0][2];
      expect(sentToken).toHaveLength(64); // 32 bytes en hex
      const [userId, storedHash, expiresAt] = resetRepo.create.mock.calls[0];
      expect(userId).toBe(1);
      expect(storedHash).not.toBe(sentToken);
      expect(storedHash).toBe(
        crypto.createHash('sha256').update(sentToken).digest('hex'),
      );
      const ttl = (expiresAt as Date).getTime() - before;
      expect(ttl).toBeGreaterThan(29 * 60 * 1000);
      expect(ttl).toBeLessThanOrEqual(30 * 60 * 1000 + 1000);
      expect(resetRepo.invalidateAllForUser).toHaveBeenCalledWith(1, tx);
    });
  });

  describe('resetPassword', () => {
    const dto = { token: 'tok-en', newPassword: 'nueva-contrasena-1' };
    const tokenHash = crypto
      .createHash('sha256')
      .update('tok-en')
      .digest('hex');

    it('token inexistente (invalido) responde 400', async () => {
      resetRepo.findByHash.mockResolvedValue(null);
      await expect(service.resetPassword(dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(credRepo.updatePassword).not.toHaveBeenCalled();
    });

    it('token expirado o ya usado (consumo atomico falla) responde 400', async () => {
      resetRepo.findByHash.mockResolvedValue({ id: 5, user_id: 1 });
      resetRepo.consumeIfValid.mockResolvedValue(false);
      await expect(service.resetPassword(dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(credRepo.updatePassword).not.toHaveBeenCalled();
      expect(refreshRepo.revokeAllForUser).not.toHaveBeenCalled();
    });

    it('busca el token por su hash, no en claro', async () => {
      resetRepo.findByHash.mockResolvedValue(null);
      await service.resetPassword(dto).catch(() => undefined);
      expect(resetRepo.findByHash.mock.calls[0][0]).toBe(tokenHash);
    });

    it('exito: cambia la contrasena, consume el token y revoca refresh tokens', async () => {
      resetRepo.findByHash.mockResolvedValue({ id: 5, user_id: 1 });
      resetRepo.consumeIfValid.mockResolvedValue(true);
      credRepo.findWithPasswordById.mockResolvedValue({
        id: 1,
        status: true,
        password: 'x',
      });

      await expect(service.resetPassword(dto)).resolves.toEqual({
        reset: true,
      });
      expect(resetRepo.consumeIfValid).toHaveBeenCalledWith(5, tx);
      const newHash = credRepo.updatePassword.mock.calls[0][1];
      await expect(bcrypt.compare(dto.newPassword, newHash)).resolves.toBe(
        true,
      );
      expect(refreshRepo.revokeAllForUser).toHaveBeenCalledWith(1, tx);
      expect(credRepo.findWithPasswordById).toHaveBeenCalledWith(1, tx);
    });

    it('token expirado o usado se rechaza antes de calcular bcrypt', async () => {
      (bcrypt.hash as jest.Mock).mockClear();
      resetRepo.findByHash.mockResolvedValue({
        id: 5,
        user_id: 1,
        used_at: null,
        expires_at: new Date(Date.now() - 1000),
      });
      await expect(service.resetPassword(dto)).rejects.toThrow(
        BadRequestException,
      );
      resetRepo.findByHash.mockResolvedValue({
        id: 5,
        user_id: 1,
        used_at: new Date(),
        expires_at: new Date(Date.now() + 60000),
      });
      await expect(service.resetPassword(dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(prisma.$transaction).not.toHaveBeenCalled();
      expect(bcrypt.hash).not.toHaveBeenCalled();
    });

    it('usuario desactivado no puede restablecer', async () => {
      resetRepo.findByHash.mockResolvedValue({ id: 5, user_id: 1 });
      resetRepo.consumeIfValid.mockResolvedValue(true);
      credRepo.findWithPasswordById.mockResolvedValue({
        id: 1,
        status: false,
        password: 'x',
      });
      await expect(service.resetPassword(dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(credRepo.updatePassword).not.toHaveBeenCalled();
    });
  });
});
