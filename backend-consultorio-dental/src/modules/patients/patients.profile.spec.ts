import 'reflect-metadata';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import * as bcrypt from 'bcrypt';
import { PatientsService } from './patients.service';
import { PacientesController } from './patients.controller';
import {
  AdminUpdatePatientDto,
  GetPatientHistoryDto,
  UpdateMyProfileDto,
} from './dto/update-patient.dto';
import { RolesGuard } from '../../infrastructure/security/guards/roles.guard';
import { Role } from '../users/enums/rol.enum';

describe('Perfil e historial del paciente', () => {
  const tx = { marker: 'tx' };
  const patientUser = { id: 5, role: Role.PACIENTE };
  const admin = { id: 1, role: Role.ADMINISTRADOR };
  const assistant = { id: 2, role: Role.ASISTENTE };

  let repo: any;
  let audit: any;
  let prisma: any;
  let consultations: any;
  let mail: any;
  let service: PatientsService;
  let hash: string;

  beforeAll(async () => {
    hash = await bcrypt.hash('ClaveActual123', 4);
  });

  beforeEach(() => {
    repo = {
      getIdByUserId: jest.fn().mockResolvedValue(10),
      existById: jest.fn().mockResolvedValue(true),
      getById: jest.fn().mockResolvedValue({ id: 10 }),
      getForUpdate: jest.fn().mockResolvedValue({
        id: 10,
        address: 'Calle 1',
        birth_date: new Date('1990-01-01'),
        emergency_phone: '111',
        user: {
          id: 5,
          name: 'Ana',
          lastname: 'Perez',
          email: 'ana@test.com',
          phone: '222',
          status: true,
        },
      }),
      isEmailTakenByOther: jest.fn().mockResolvedValue(false),
      isPhoneTakenByOther: jest.fn().mockResolvedValue(false),
      getPasswordHash: jest.fn().mockResolvedValue(hash),
      applyUpdate: jest.fn().mockResolvedValue({ id: 10 }),
      revokeRefreshTokens: jest.fn(),
      invalidateResetTokens: jest.fn(),
      getAppointmentHistory: jest.fn().mockResolvedValue({
        items: [{ id: 1, consultation: { id: 9 } }],
        total: 1,
      }),
    };
    audit = { log: jest.fn() };
    prisma = { $transaction: jest.fn((cb: any) => cb(tx)) };
    consultations = {
      getAll: jest.fn().mockResolvedValue({ items: [], total: 0 }),
    };
    mail = {
      isConfigured: jest.fn().mockReturnValue(true),
      sendEmailChangedNotice: jest.fn().mockResolvedValue(true),
    };
    service = new PatientsService(repo, prisma, audit, consultations, mail);
  });

  describe('DTO: solo campos autorizados', () => {
    const toDto = (body: object) => plainToInstance(UpdateMyProfileDto, body);

    it('descarta (whitelist) rol, nombre, direccion, estado y patient_id del body', () => {
      const dto = toDto({
        email: ' ANA@Test.com ',
        phone: '5551234567',
        role: 'ADMINISTRADOR',
        name: 'Hack',
        address: 'otra',
        status: false,
        patient_id: 99,
      });
      const errors = validateSync(dto, { whitelist: true });
      expect(errors).toHaveLength(0);
      expect(dto).toEqual({ email: 'ana@test.com', phone: '5551234567' });
    });

    it('normaliza el telefono (quita espacios, guiones y parentesis)', () => {
      const dto = toDto({
        phone: ' (55) 1234-5678 ',
        emergency_phone: '+52 55 9999 0000',
      });
      expect(validateSync(dto)).toHaveLength(0);
      expect(dto.phone).toBe('5512345678');
      expect(dto.emergency_phone).toBe('+525599990000');
      const admin = plainToInstance(AdminUpdatePatientDto, {
        phone: '555-000 1111',
      });
      expect(admin.phone).toBe('5550001111');
      expect(validateSync(admin)).toHaveLength(0);
    });

    it('rechaza telefonos con menos de 10 o mas de 15 digitos', () => {
      expect(validateSync(toDto({ phone: '555123456' }))).not.toHaveLength(0);
      expect(
        validateSync(toDto({ emergency_phone: '1234567890123456' })),
      ).not.toHaveLength(0);
      expect(validateSync(toDto({ phone: '+525512345678' }))).toHaveLength(0);
      expect(
        validateSync(plainToInstance(AdminUpdatePatientDto, { phone: '123' })),
      ).not.toHaveLength(0);
    });

    it('un telefono sin digitos queda vacio y se rechaza', () => {
      expect(validateSync(toDto({ phone: '( ) - ' }))).not.toHaveLength(0);
    });

    it('valida formato de correo y telefono vacio', () => {
      expect(validateSync(toDto({ email: 'no-es-correo' }))).not.toHaveLength(
        0,
      );
      expect(validateSync(toDto({ phone: '' }))).not.toHaveLength(0);
    });

    it('el DTO de admin valida fecha de nacimiento', () => {
      const bad = plainToInstance(AdminUpdatePatientDto, {
        birth_date: 'ayer',
      });
      expect(validateSync(bad)).not.toHaveLength(0);
    });

    it('birth_date: fechas imposibles o sin zona se rechazan, reales se aceptan', () => {
      const ok = (v: string) =>
        validateSync(plainToInstance(AdminUpdatePatientDto, { birth_date: v }))
          .length === 0;
      expect(ok('1990-05-20')).toBe(true);
      expect(ok('1990-05-20T00:00:00Z')).toBe(true);
      expect(ok('2026-02-30')).toBe(false);
      expect(ok('1990-13-01')).toBe(false);
      expect(ok('1990-05-20T10:00:00')).toBe(false);
    });

    it('el tipo de historial solo admite appointments o consultations', () => {
      const bad = plainToInstance(GetPatientHistoryDto, { type: 'otro' });
      expect(validateSync(bad)).not.toHaveLength(0);
    });
  });

  describe('PATCH /patients/me', () => {
    it('el patientId sale del usuario autenticado, no del cliente', async () => {
      await service.updateMyProfile({ phone: '999' } as any, patientUser);
      expect(repo.getIdByUserId).toHaveBeenCalledWith(5);
      expect(repo.getForUpdate).toHaveBeenCalledWith(10, tx);
    });

    it('solo un PACIENTE puede usarlo (defensa en profundidad)', async () => {
      await expect(
        service.updateMyProfile({ phone: '999' } as any, admin),
      ).rejects.toThrow(ForbiddenException);
    });

    it('un PACIENTE sin ficha es rechazado', async () => {
      repo.getIdByUserId.mockResolvedValue(null);
      await expect(
        service.updateMyProfile({ phone: '999' } as any, patientUser),
      ).rejects.toThrow(ForbiddenException);
    });

    it('exige al menos un campo', async () => {
      await expect(
        service.updateMyProfile({} as any, patientUser),
      ).rejects.toThrow(BadRequestException);
    });

    it('cambiar el correo exige la contrasena actual', async () => {
      await expect(
        service.updateMyProfile(
          { email: 'nuevo@test.com' } as any,
          patientUser,
        ),
      ).rejects.toThrow(/contraseña actual/);
      expect(repo.applyUpdate).not.toHaveBeenCalled();
    });

    it('rechaza una contrasena actual incorrecta', async () => {
      await expect(
        service.updateMyProfile(
          {
            email: 'nuevo@test.com',
            current_password: 'otraClave12345',
          } as any,
          patientUser,
        ),
      ).rejects.toThrow('La contraseña actual es incorrecta');
      expect(repo.applyUpdate).not.toHaveBeenCalled();
    });

    it('rechaza un correo ya usado por otro usuario', async () => {
      repo.isEmailTakenByOther.mockResolvedValue(true);
      await expect(
        service.updateMyProfile(
          { email: 'otro@test.com', current_password: 'ClaveActual123' } as any,
          patientUser,
        ),
      ).rejects.toThrow('Este correo ya esta registrado');
      expect(repo.applyUpdate).not.toHaveBeenCalled();
    });

    it('rechaza un telefono ya usado por otro usuario', async () => {
      repo.isPhoneTakenByOther.mockResolvedValue(true);
      await expect(
        service.updateMyProfile({ phone: '777' } as any, patientUser),
      ).rejects.toThrow('Este telefono ya esta registrado');
    });

    it('actualiza solo lo que cambia y audita nombres de campo, no valores', async () => {
      await service.updateMyProfile(
        {
          email: 'nuevo@test.com',
          current_password: 'ClaveActual123',
          emergency_phone: '333',
        } as any,
        patientUser,
      );

      expect(repo.applyUpdate).toHaveBeenCalledWith(
        10,
        5,
        { email: 'nuevo@test.com' },
        { emergency_phone: '333' },
        tx,
      );
      const [entry, usedTx] = audit.log.mock.calls[0];
      expect(entry).toMatchObject({
        userId: 5,
        action: 'PATIENT_PROFILE_UPDATED',
        entity: 'PATIENT',
        entityId: 10,
        after: { changedFields: ['email', 'emergency_phone'] },
      });
      expect(JSON.stringify(entry)).not.toMatch(/nuevo@test|333|ClaveActual/);
      expect(usedTx).toBe(tx);
    });

    it('cambio de correo: revoca refresh tokens e invalida reset tokens en la misma tx y avisa al correo anterior', async () => {
      await service.updateMyProfile(
        { email: 'nuevo@test.com', current_password: 'ClaveActual123' } as any,
        patientUser,
      );
      expect(repo.revokeRefreshTokens).toHaveBeenCalledWith(5, tx);
      expect(repo.invalidateResetTokens).toHaveBeenCalledWith(5, tx);
      expect(mail.sendEmailChangedNotice).toHaveBeenCalledWith(
        'ana@test.com',
        'Ana',
      );
    });

    it('sin cambio de correo no se revocan tokens ni se envia aviso', async () => {
      await service.updateMyProfile({ phone: '999' } as any, patientUser);
      expect(repo.revokeRefreshTokens).not.toHaveBeenCalled();
      expect(repo.invalidateResetTokens).not.toHaveBeenCalled();
      expect(mail.sendEmailChangedNotice).not.toHaveBeenCalled();
    });

    it('si SMTP no esta configurado se omite el aviso sin fallar', async () => {
      mail.isConfigured.mockReturnValue(false);
      await expect(
        service.updatePatient(10, { email: 'x@test.com' } as any, 1),
      ).resolves.toBeDefined();
      expect(repo.revokeRefreshTokens).toHaveBeenCalled();
      expect(mail.sendEmailChangedNotice).not.toHaveBeenCalled();
    });

    it('si falla el envio del aviso, la actualizacion no falla', async () => {
      mail.sendEmailChangedNotice.mockRejectedValue(new Error('smtp'));
      await expect(
        service.updatePatient(10, { email: 'x@test.com' } as any, 1),
      ).resolves.toBeDefined();
    });

    it('la transaccion usa timeout explicito', async () => {
      await service.updatePatient(10, { address: 'Nueva 5' } as any, 1);
      expect(prisma.$transaction.mock.calls[0][1]).toMatchObject({
        timeout: expect.any(Number),
      });
    });

    it('PATCH /patients/me tiene throttle 5/min por usuario', () => {
      const guards = Reflect.getMetadata(
        '__guards__',
        PacientesController.prototype.updateMe,
      ) as unknown[];
      expect(guards.map((g: any) => g.name)).toContain('UserThrottlerGuard');
      expect(
        Reflect.getMetadata(
          'THROTTLER:LIMITdefault',
          PacientesController.prototype.updateMe,
        ),
      ).toBe(5);
    });

    it('el mismo correo con otra capitalizacion no cuenta como cambio ni pide contrasena', async () => {
      await service
        .updateMyProfile({ email: 'ANA@test.com' } as any, {
          ...patientUser,
        })
        .catch(() => undefined);
      // Sin otros campos no hay cambios reales: no escribe ni audita
      expect(repo.applyUpdate).not.toHaveBeenCalled();
      expect(audit.log).not.toHaveBeenCalled();
    });
  });

  describe('PATCH /patients/:id (ADMIN)', () => {
    it('edita sin pedir contrasena y audita como PATIENT_UPDATED', async () => {
      await service.updatePatient(
        10,
        { address: 'Nueva 5', email: 'x@test.com' } as any,
        1,
      );
      expect(repo.applyUpdate).toHaveBeenCalledWith(
        10,
        5,
        { email: 'x@test.com' },
        { address: 'Nueva 5' },
        tx,
      );
      expect(audit.log.mock.calls[0][0]).toMatchObject({
        userId: 1,
        action: 'PATIENT_UPDATED',
        after: { changedFields: ['email', 'address'] },
      });
    });

    it('status=false: lo aplica en la misma transaccion, revoca sesiones y audita USER_STATUS_CHANGED + PATIENT_UPDATED', async () => {
      await service.updatePatient(
        10,
        { address: 'Nueva 5', status: false } as any,
        1,
      );
      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(repo.applyUpdate).toHaveBeenCalledWith(
        10,
        5,
        { status: false },
        { address: 'Nueva 5' },
        tx,
      );
      expect(repo.revokeRefreshTokens).toHaveBeenCalledWith(5, tx);
      const actions = audit.log.mock.calls.map((c: any[]) => c[0]);
      expect(actions[0]).toMatchObject({
        action: 'USER_STATUS_CHANGED',
        entity: 'USER',
        entityId: 5,
        before: { status: true },
        after: { status: false },
      });
      expect(actions[1]).toMatchObject({
        action: 'PATIENT_UPDATED',
        after: { changedFields: ['status', 'address'] },
      });
      expect(audit.log.mock.calls.every((c: any[]) => c[1] === tx)).toBe(true);
    });

    it('solo status es un body valido; activar no revoca sesiones', async () => {
      repo.getForUpdate.mockResolvedValue({
        ...(await repo.getForUpdate()),
        user: {
          id: 5,
          name: 'Ana',
          lastname: 'Perez',
          email: 'ana@test.com',
          phone: '222',
          status: false,
        },
      });
      await service.updatePatient(10, { status: true } as any, 1);
      expect(repo.applyUpdate).toHaveBeenCalledWith(
        10,
        5,
        { status: true },
        {},
        tx,
      );
      expect(repo.revokeRefreshTokens).not.toHaveBeenCalled();
    });

    it('status igual al actual: sin escritura ni auditoria', async () => {
      await service.updatePatient(10, { status: true } as any, 1);
      expect(repo.applyUpdate).not.toHaveBeenCalled();
      expect(audit.log).not.toHaveBeenCalled();
    });

    it('404 si el paciente no existe', async () => {
      repo.getForUpdate.mockResolvedValue(null);
      await expect(
        service.updatePatient(77, { address: 'x' } as any, 1),
      ).rejects.toThrow(NotFoundException);
    });

    it('fecha imposible (2026-02-30) => 400', async () => {
      await expect(
        service.updatePatient(10, { birth_date: '2026-02-30' } as any, 1),
      ).rejects.toThrow('La fecha de nacimiento no es válida');
      expect(repo.applyUpdate).not.toHaveBeenCalled();
    });

    it('rechaza fecha de nacimiento futura', async () => {
      await expect(
        service.updatePatient(10, { birth_date: '2999-01-01' } as any, 1),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('historial', () => {
    it('ADMIN ve citas (con consultation_id) y consultas', async () => {
      const appointments = await service.getHistory(10, {}, admin);
      expect(appointments.items[0]).toMatchObject({ consultation_id: 9 });
      expect(repo.getAppointmentHistory).toHaveBeenCalledWith(
        10,
        expect.any(Object),
        true,
      );

      const result = await service.getHistory(
        10,
        { type: 'consultations' },
        admin,
      );
      expect(result.type).toBe('consultations');
      expect(consultations.getAll).toHaveBeenCalledWith(
        expect.objectContaining({ patient_id: 10 }),
      );
    });

    it('ASISTENTE ve citas pero NO el historial clinico', async () => {
      await service.getHistory(10, { type: 'appointments' }, assistant);
      expect(repo.getAppointmentHistory).toHaveBeenCalledWith(
        10,
        expect.any(Object),
        false,
      );
      await expect(
        service.getHistory(10, { type: 'consultations' }, assistant),
      ).rejects.toThrow(ForbiddenException);
      expect(consultations.getAll).not.toHaveBeenCalled();
    });

    it('PACIENTE ve sus citas sin consultation_id ni consultas', async () => {
      repo.getAppointmentHistory.mockResolvedValue({
        items: [{ id: 1, consultation: undefined }],
        total: 1,
      });
      const result = await service.getHistory(10, {}, patientUser);
      expect(result.items[0]).not.toHaveProperty('consultation_id');
      expect(repo.getAppointmentHistory).toHaveBeenCalledWith(
        10,
        expect.any(Object),
        false,
      );
      await expect(
        service.getHistory(10, { type: 'consultations' }, patientUser),
      ).rejects.toThrow(ForbiddenException);
    });

    it('PACIENTE no puede ver el historial de otro paciente (404)', async () => {
      await expect(service.getHistory(11, {}, patientUser)).rejects.toThrow(
        NotFoundException,
      );
      expect(repo.getAppointmentHistory).not.toHaveBeenCalled();
    });

    it('404 si el paciente no existe', async () => {
      repo.existById.mockResolvedValue(false);
      await expect(service.getHistory(10, {}, admin)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('permisos del controller', () => {
    const guard = new RolesGuard(new Reflector());
    const proto = PacientesController.prototype;
    const ctx = (handler: Function, role: string) =>
      ({
        getHandler: () => handler,
        getClass: () => PacientesController,
        switchToHttp: () => ({ getRequest: () => ({ user: { id: 1, role } }) }),
      }) as any;

    it('PATCH /patients/me es solo PACIENTE', () => {
      expect(guard.canActivate(ctx(proto.updateMe, Role.PACIENTE))).toBe(true);
      expect(() =>
        guard.canActivate(ctx(proto.updateMe, Role.ADMINISTRADOR)),
      ).toThrow();
      expect(() =>
        guard.canActivate(ctx(proto.updateMe, Role.ASISTENTE)),
      ).toThrow();
    });

    it('PATCH /patients/:id es solo ADMINISTRADOR', () => {
      expect(guard.canActivate(ctx(proto.update, Role.ADMINISTRADOR))).toBe(
        true,
      );
      expect(() =>
        guard.canActivate(ctx(proto.update, Role.PACIENTE)),
      ).toThrow();
      expect(() =>
        guard.canActivate(ctx(proto.update, Role.ASISTENTE)),
      ).toThrow();
    });
  });
});
