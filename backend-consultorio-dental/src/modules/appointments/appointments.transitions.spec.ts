import 'reflect-metadata';
import { validateSync } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { Prisma } from '@prisma/client';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { CancelAppointmentDto } from './dto/cancel-appointment.dto';
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto';
import { Role } from '../users/enums/rol.enum';
import { ROLES_KEY } from 'src/infrastructure/security/decorators/roles.decorator';

describe('AppointmentsService - transiciones y permisos', () => {
  const admin = { id: 1, role: Role.ADMINISTRADOR };
  const assistant = { id: 2, role: Role.ASISTENTE };
  const patientUser = { id: 5, role: Role.PACIENTE };
  const tx = { marker: 'tx' };
  const future = new Date(Date.now() + 7 * 86_400_000);
  const base = () => ({
    id: 7,
    scheduled_at: new Date(Date.UTC(2030, 0, 10, 16, 0)),
    durationMinutes: 30,
    status: 'PENDIENTE',
    service_id: 1,
    patient_id: 10,
    patient: { user_id: 5 },
  });

  let appointments: any;
  let services: any;
  let patients: any;
  let prisma: any;
  let audit: any;
  let service: AppointmentsService;

  beforeEach(() => {
    appointments = {
      getByIdWithOwner: jest.fn().mockResolvedValue(base()),
      updateIfStatus: jest.fn().mockResolvedValue(true),
      getAppointmentsByDate: jest.fn().mockResolvedValue([]),
      createReschedule: jest.fn().mockResolvedValue({}),
      getActiveAdminIds: jest.fn().mockResolvedValue([1, 9]),
      createNotifications: jest.fn().mockResolvedValue(undefined),
    };
    services = {
      getById: jest.fn().mockResolvedValue({ id: 1, status: true }),
    };
    patients = { getIdByUserId: jest.fn().mockResolvedValue(10) };
    prisma = {
      $transaction: jest.fn((work: (t: unknown) => unknown) => work(tx)),
    };
    audit = { log: jest.fn().mockResolvedValue(undefined) };
    service = new AppointmentsService(
      appointments,
      services,
      patients,
      prisma,
      audit,
    );
  });

  const withStatus = (status: string, extra: object = {}) =>
    appointments.getByIdWithOwner.mockResolvedValue({
      ...base(),
      status,
      ...extra,
    });

  describe('confirmar', () => {
    it('ADMIN confirma desde PENDIENTE con update atomico y notifica al paciente', async () => {
      await expect(service.confirmAppointment(7, admin)).resolves.toEqual({
        id: 7,
        status: 'CONFIRMADA',
      });
      expect(appointments.updateIfStatus).toHaveBeenCalledWith(
        7,
        'PENDIENTE',
        { status: 'CONFIRMADA' },
        tx,
      );
      expect(appointments.createNotifications.mock.calls[0][0][0].user_id).toBe(
        5,
      );
      expect(appointments.createNotifications.mock.calls[0][1]).toBe(tx);
    });

    it('audita la confirmacion dentro de la misma transaccion', async () => {
      await service.confirmAppointment(7, admin);
      expect(audit.log).toHaveBeenCalledTimes(1);
      const [entry, usedTx] = audit.log.mock.calls[0];
      expect(entry).toMatchObject({
        userId: 1,
        action: 'APPOINTMENT_CONFIRMED',
        entity: 'APPOINTMENT',
        entityId: 7,
        before: { status: 'PENDIENTE' },
        after: { status: 'CONFIRMADA' },
      });
      expect(usedTx).toBe(tx);
    });

    it('si la operacion falla no se audita', async () => {
      appointments.updateIfStatus.mockResolvedValue(false);
      await expect(service.confirmAppointment(7, admin)).rejects.toThrow(
        ConflictException,
      );
      expect(audit.log).not.toHaveBeenCalled();
    });

    it('la auditoria de cancelacion no copia el motivo (texto libre)', async () => {
      await service.cancelAppointment(7, { reason: 'dato privado' }, admin);
      const [entry, usedTx] = audit.log.mock.calls[0];
      expect(entry.action).toBe('APPOINTMENT_CANCELLED');
      expect(JSON.stringify(entry)).not.toContain('dato privado');
      expect(usedTx).toBe(tx);
    });

    it('cita legacy REPROGRAMADA: ADMIN la confirma con update atomico desde ese estado', async () => {
      withStatus('REPROGRAMADA');
      await expect(service.confirmAppointment(7, admin)).resolves.toEqual({
        id: 7,
        status: 'CONFIRMADA',
      });
      expect(appointments.updateIfStatus.mock.calls[0].slice(0, 3)).toEqual([
        7,
        'REPROGRAMADA',
        { status: 'CONFIRMADA' },
      ]);
    });

    it('sin usuario autenticado responde 401 en todas las operaciones', async () => {
      const none = undefined as any;
      await expect(service.confirmAppointment(7, none)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.completeAppointment(7, none)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(
        service.cancelAppointment(7, { reason: 'x' }, none),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        service.rescheduleAppointment(
          7,
          { scheduled_at: future, reason: 'x' },
          none,
        ),
      ).rejects.toThrow(UnauthorizedException);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('el controlador responde 401 si el request no trae usuario', async () => {
      const controller = new AppointmentsController(service);
      await expect(controller.confirmAppointment(7, {} as any)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(
        controller.getAllAppointments({} as any, {} as any),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('ASISTENTE y PACIENTE no pueden confirmar (403) y no se toca la BD', async () => {
      await expect(service.confirmAppointment(7, assistant)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.confirmAppointment(7, patientUser)).rejects.toThrow(
        ForbiddenException,
      );
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it.each(['CONFIRMADA', 'COMPLETADA', 'CANCELADA'])(
      'no confirma desde %s (409)',
      async (status) => {
        withStatus(status);
        await expect(service.confirmAppointment(7, admin)).rejects.toThrow(
          ConflictException,
        );
        expect(appointments.updateIfStatus).not.toHaveBeenCalled();
      },
    );

    it('carrera de estado: si el update atomico no afecta filas responde 409', async () => {
      appointments.updateIfStatus.mockResolvedValue(false);
      await expect(service.confirmAppointment(7, admin)).rejects.toThrow(
        ConflictException,
      );
      expect(appointments.createNotifications).not.toHaveBeenCalled();
    });

    it('cita inexistente responde 404', async () => {
      appointments.getByIdWithOwner.mockResolvedValue(null);
      await expect(service.confirmAppointment(7, admin)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('completar', () => {
    const started = { scheduled_at: new Date(Date.now() - 3_600_000) };

    it('ADMIN completa desde CONFIRMADA', async () => {
      withStatus('CONFIRMADA', started);
      await expect(service.completeAppointment(7, admin)).resolves.toEqual({
        id: 7,
        status: 'COMPLETADA',
      });
      expect(appointments.updateIfStatus.mock.calls[0].slice(0, 3)).toEqual([
        7,
        'CONFIRMADA',
        { status: 'COMPLETADA' },
      ]);
    });

    it('ASISTENTE y PACIENTE no pueden completar (403)', async () => {
      withStatus('CONFIRMADA', started);
      await expect(service.completeAppointment(7, assistant)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.completeAppointment(7, patientUser)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it.each(['PENDIENTE', 'COMPLETADA', 'CANCELADA'])(
      'no completa desde %s (409)',
      async (status) => {
        withStatus(status, started);
        await expect(service.completeAppointment(7, admin)).rejects.toThrow(
          ConflictException,
        );
      },
    );

    it('carrera de estado: update sin filas responde 409', async () => {
      withStatus('CONFIRMADA', started);
      appointments.updateIfStatus.mockResolvedValue(false);
      await expect(service.completeAppointment(7, admin)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('reglas por fecha (confirmar, completar, paciente)', () => {
    const NOW = new Date('2030-06-01T12:00:00.000Z').getTime();
    const at = (offsetMs: number) => ({
      scheduled_at: new Date(NOW + offsetMs),
    });
    const dto = { reason: 'Motivo' };
    let nowSpy: jest.SpyInstance;

    beforeEach(() => {
      nowSpy = jest.spyOn(Date, 'now').mockReturnValue(NOW);
    });
    afterEach(() => nowSpy.mockRestore());

    it('confirmar: se puede aunque la cita sea futura, sea ahora o ya haya pasado', async () => {
      for (const offset of [1, 0, -1, -86_400_000]) {
        appointments.updateIfStatus.mockClear();
        withStatus('PENDIENTE', at(offset));
        await expect(
          service.confirmAppointment(7, admin),
        ).resolves.toMatchObject({ status: 'CONFIRMADA' });
        expect(appointments.updateIfStatus).toHaveBeenCalledTimes(1);
      }
    });

    it('completar: exactamente ahora o pasada OK; futura responde 409 sin escribir', async () => {
      for (const offset of [0, -1, -86_400_000]) {
        withStatus('CONFIRMADA', at(offset));
        await expect(
          service.completeAppointment(7, admin),
        ).resolves.toMatchObject({ status: 'COMPLETADA' });
      }

      appointments.updateIfStatus.mockClear();
      withStatus('CONFIRMADA', at(1));
      await expect(service.completeAppointment(7, admin)).rejects.toThrow(
        /aún no ha iniciado/,
      );
      expect(appointments.updateIfStatus).not.toHaveBeenCalled();
    });

    it('completar: el chequeo de rol sigue antes (ASISTENTE 403 aunque la fecha sea valida)', async () => {
      withStatus('CONFIRMADA', at(-1));
      await expect(service.completeAppointment(7, assistant)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('PACIENTE no cancela ni reprograma una cita pasada o exactamente ahora (409)', async () => {
      for (const offset of [0, -1, -86_400_000]) {
        withStatus('PENDIENTE', at(offset));
        await expect(
          service.cancelAppointment(7, dto, patientUser),
        ).rejects.toThrow(ConflictException);
        await expect(
          service.rescheduleAppointment(
            7,
            { scheduled_at: new Date(NOW + 86_400_000), reason: 'x' } as any,
            patientUser,
          ),
        ).rejects.toThrow(/ya pasó/);
      }
      expect(appointments.updateIfStatus).not.toHaveBeenCalled();
    });

    it('PACIENTE si cancela y reprograma una cita futura propia', async () => {
      withStatus('PENDIENTE', at(1));
      await expect(
        service.cancelAppointment(7, dto, patientUser),
      ).resolves.toMatchObject({ status: 'CANCELADA' });
      await expect(
        service.rescheduleAppointment(
          7,
          { scheduled_at: new Date(NOW + 86_400_000), reason: 'x' } as any,
          patientUser,
        ),
      ).resolves.toMatchObject({ id: 7 });
    });

    it('ADMIN y ASISTENTE si cancelan y reprograman una cita pasada', async () => {
      for (const actor of [admin, assistant]) {
        withStatus('PENDIENTE', at(-86_400_000));
        await expect(
          service.cancelAppointment(7, dto, actor),
        ).resolves.toMatchObject({ status: 'CANCELADA' });
        await expect(
          service.rescheduleAppointment(
            7,
            { scheduled_at: new Date(NOW + 86_400_000), reason: 'x' } as any,
            actor,
          ),
        ).resolves.toMatchObject({ id: 7 });
      }
    });
  });

  describe('cancelar', () => {
    const dto = { reason: '  Surgio un imprevisto  ' };

    it('ADMIN cancela una CONFIRMADA: guarda motivo y quien cancelo, notifica al paciente', async () => {
      withStatus('CONFIRMADA');
      await service.cancelAppointment(7, dto, admin);

      const [, expected, data, usedTx] =
        appointments.updateIfStatus.mock.calls[0];
      expect(expected).toBe('CONFIRMADA');
      expect(data).toMatchObject({
        status: 'CANCELADA',
        cancel_reason: 'Surgio un imprevisto',
        cancelled_by_id: 1,
      });
      expect(data.cancelled_at).toBeInstanceOf(Date);
      expect(usedTx).toBe(tx);
      expect(appointments.createNotifications.mock.calls[0][0]).toHaveLength(1);
      expect(appointments.createNotifications.mock.calls[0][0][0].user_id).toBe(
        5,
      );
    });

    it('ASISTENTE puede cancelar PENDIENTE y CONFIRMADA', async () => {
      await expect(
        service.cancelAppointment(7, dto, assistant),
      ).resolves.toMatchObject({ status: 'CANCELADA' });
      withStatus('CONFIRMADA');
      await expect(
        service.cancelAppointment(7, dto, assistant),
      ).resolves.toMatchObject({ status: 'CANCELADA' });
    });

    it('PACIENTE cancela su cita PENDIENTE y se notifica a todos los admins', async () => {
      await service.cancelAppointment(7, dto, patientUser);
      const notifications = appointments.createNotifications.mock.calls[0][0];
      expect(notifications.map((n: any) => n.user_id)).toEqual([1, 9]);
      expect(appointments.updateIfStatus.mock.calls[0][2].cancelled_by_id).toBe(
        5,
      );
    });

    it('cita legacy REPROGRAMADA: se cancela con las mismas reglas que PENDIENTE (incluido PACIENTE propio)', async () => {
      withStatus('REPROGRAMADA');
      await expect(
        service.cancelAppointment(7, dto, patientUser),
      ).resolves.toMatchObject({ status: 'CANCELADA' });
      expect(appointments.updateIfStatus.mock.calls[0][1]).toBe('REPROGRAMADA');

      withStatus('REPROGRAMADA', { patient_id: 11 });
      await expect(
        service.cancelAppointment(7, dto, patientUser),
      ).rejects.toThrow(NotFoundException);
    });

    it('PACIENTE no puede cancelar una cita CONFIRMADA (403)', async () => {
      withStatus('CONFIRMADA');
      await expect(
        service.cancelAppointment(7, dto, patientUser),
      ).rejects.toThrow(ForbiddenException);
      expect(appointments.updateIfStatus).not.toHaveBeenCalled();
    });

    it('PACIENTE no puede cancelar una cita ajena (404)', async () => {
      withStatus('PENDIENTE', { patient_id: 11 });
      await expect(
        service.cancelAppointment(7, dto, patientUser),
      ).rejects.toThrow(NotFoundException);
    });

    it.each(['COMPLETADA', 'CANCELADA'])(
      'nadie cancela una cita %s (409), ni el ADMIN',
      async (status) => {
        withStatus(status);
        await expect(service.cancelAppointment(7, dto, admin)).rejects.toThrow(
          ConflictException,
        );
      },
    );

    it('rechaza motivo vacio (400)', async () => {
      await expect(
        service.cancelAppointment(7, { reason: '   ' }, admin),
      ).rejects.toThrow(BadRequestException);
    });

    it('carrera de estado: update sin filas responde 409 sin notificar', async () => {
      appointments.updateIfStatus.mockResolvedValue(false);
      await expect(service.cancelAppointment(7, dto, admin)).rejects.toThrow(
        ConflictException,
      );
      expect(appointments.createNotifications).not.toHaveBeenCalled();
    });

    it('el DTO exige motivo y maximo 500 caracteres', () => {
      const run = (reason: unknown) =>
        validateSync(plainToInstance(CancelAppointmentDto, { reason }));
      expect(run(undefined).length).toBeGreaterThan(0);
      expect(run('').length).toBeGreaterThan(0);
      expect(run('x'.repeat(501)).length).toBeGreaterThan(0);
      expect(run('x'.repeat(500))).toHaveLength(0);
    });
  });

  describe('reprogramar', () => {
    const dto = (scheduled_at: Date, reason?: string) =>
      ({ scheduled_at, reason }) as any;
    const R = 'Motivo de prueba';
    const p2034 = () =>
      new Prisma.PrismaClientKnownRequestError('x', {
        code: 'P2034',
        clientVersion: 't',
      });
    const minutes = (m: number) => new Date(future.getTime() + m * 60_000);

    it('reprograma en transaccion Serializable, conserva estado, guarda historial y notifica', async () => {
      withStatus('CONFIRMADA');
      const result = await service.rescheduleAppointment(
        7,
        dto(future, 'Cambio'),
        admin,
      );

      expect(prisma.$transaction.mock.calls[0][1]).toEqual({
        isolationLevel: 'Serializable',
      });
      expect(result.status).toBe('CONFIRMADA');
      // revalida disponibilidad excluyendo la propia cita
      expect(appointments.getAppointmentsByDate.mock.calls[0][2]).toBe(7);
      expect(appointments.getAppointmentsByDate.mock.calls[0][3]).toBe(tx);
      expect(services.getById).toHaveBeenCalledWith(1, tx);
      expect(appointments.updateIfStatus.mock.calls[0][1]).toBe('CONFIRMADA');
      expect(appointments.createReschedule.mock.calls[0][0]).toMatchObject({
        appointment_id: 7,
        changed_by_id: 1,
        reason: 'Cambio',
        previous_scheduled_at: base().scheduled_at,
        new_scheduled_at: future,
      });
      expect(appointments.createNotifications).toHaveBeenCalled();
    });

    it('choque con otra cita: 409 y no escribe nada', async () => {
      appointments.getAppointmentsByDate.mockResolvedValue([
        { scheduled_at: minutes(-10), durationMinutes: 30 },
      ]);
      await expect(
        service.rescheduleAppointment(7, dto(future, R), admin),
      ).rejects.toThrow(ConflictException);
      expect(appointments.updateIfStatus).not.toHaveBeenCalled();
      expect(appointments.createReschedule).not.toHaveBeenCalled();
    });

    it('citas consecutivas no chocan (solape estricto)', async () => {
      appointments.getAppointmentsByDate.mockResolvedValue([
        { scheduled_at: minutes(-30), durationMinutes: 30 },
      ]);
      await expect(
        service.rescheduleAppointment(7, dto(future, R), admin),
      ).resolves.toBeDefined();
    });

    it('rechaza fecha pasada (400) sin abrir transaccion', async () => {
      await expect(
        service.rescheduleAppointment(
          7,
          dto(new Date(Date.now() - 1000), R),
          admin,
        ),
      ).rejects.toThrow(BadRequestException);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('rechaza servicio inactivo (400)', async () => {
      services.getById.mockResolvedValue({ id: 1, status: false });
      await expect(
        service.rescheduleAppointment(7, dto(future, R), admin),
      ).rejects.toThrow(BadRequestException);
    });

    it('rechaza la misma fecha (400)', async () => {
      await expect(
        service.rescheduleAppointment(7, dto(base().scheduled_at, R), admin),
      ).rejects.toThrow(BadRequestException);
    });

    it('el motivo es obligatorio: vacio o solo espacios responde 400 sin abrir transaccion', async () => {
      for (const reason of [undefined, '', '   ']) {
        await expect(
          service.rescheduleAppointment(7, dto(future, reason), admin),
        ).rejects.toThrow(BadRequestException);
      }
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('guarda el motivo recortado en el historial', async () => {
      await service.rescheduleAppointment(7, dto(future, '  Viaje  '), admin);
      expect(appointments.createReschedule.mock.calls[0][0].reason).toBe(
        'Viaje',
      );
    });

    it('DTO: el motivo es requerido', () => {
      const run = (reason: unknown) =>
        validateSync(
          plainToInstance(RescheduleAppointmentDto, {
            scheduled_at: future.toISOString(),
            reason,
          }),
        );
      expect(run(undefined).length).toBeGreaterThan(0);
      expect(run('').length).toBeGreaterThan(0);
      expect(run('x'.repeat(500))).toHaveLength(0);
    });

    it('cita legacy REPROGRAMADA: PACIENTE propio la reprograma y conserva el estado', async () => {
      withStatus('REPROGRAMADA');
      await expect(
        service.rescheduleAppointment(7, dto(future, R), patientUser),
      ).resolves.toMatchObject({ status: 'REPROGRAMADA' });
      expect(appointments.updateIfStatus.mock.calls[0][1]).toBe('REPROGRAMADA');
    });

    it('PACIENTE reprograma su PENDIENTE y se avisa a los admins', async () => {
      await service.rescheduleAppointment(7, dto(future, R), patientUser);
      expect(
        appointments.createNotifications.mock.calls[0][0].map(
          (n: any) => n.user_id,
        ),
      ).toEqual([1, 9]);
    });

    it('PACIENTE no reprograma una CONFIRMADA (403) ni una ajena (404)', async () => {
      withStatus('CONFIRMADA');
      await expect(
        service.rescheduleAppointment(7, dto(future, R), patientUser),
      ).rejects.toThrow(ForbiddenException);
      withStatus('PENDIENTE', { patient_id: 11 });
      await expect(
        service.rescheduleAppointment(7, dto(future, R), patientUser),
      ).rejects.toThrow(NotFoundException);
    });

    it('ASISTENTE puede reprogramar', async () => {
      await expect(
        service.rescheduleAppointment(7, dto(future, R), assistant),
      ).resolves.toMatchObject({ id: 7 });
    });

    it.each(['COMPLETADA', 'CANCELADA'])(
      'no reprograma una cita %s (409)',
      async (status) => {
        withStatus(status);
        await expect(
          service.rescheduleAppointment(7, dto(future, R), admin),
        ).rejects.toThrow(ConflictException);
      },
    );

    it('carrera de estado: update sin filas responde 409 sin historial', async () => {
      appointments.updateIfStatus.mockResolvedValue(false);
      await expect(
        service.rescheduleAppointment(7, dto(future, R), admin),
      ).rejects.toThrow(ConflictException);
      expect(appointments.createReschedule).not.toHaveBeenCalled();
    });

    it('reintenta ante P2034 y mapea la restriccion EXCLUDE a 409', async () => {
      prisma.$transaction
        .mockRejectedValueOnce(p2034())
        .mockImplementationOnce((work: (t: unknown) => unknown) => work(tx));
      await expect(
        service.rescheduleAppointment(7, dto(future, R), admin),
      ).resolves.toBeDefined();

      prisma.$transaction.mockRejectedValueOnce(
        new Error('violates exclusion constraint "appointments_no_overlap"'),
      );
      await expect(
        service.rescheduleAppointment(7, dto(future, R), admin),
      ).rejects.toThrow(ConflictException);
    });

    it('el DTO rechaza fecha pasada y motivo mayor a 500', () => {
      const run = (o: object) =>
        validateSync(plainToInstance(RescheduleAppointmentDto, o));
      expect(
        run({ scheduled_at: future.toISOString(), reason: 'ok' }),
      ).toHaveLength(0);
      expect(
        run({
          scheduled_at: new Date(Date.now() - 86_400_000).toISOString(),
          reason: 'ok',
        }).length,
      ).toBeGreaterThan(0);
      expect(
        run({ scheduled_at: future.toISOString(), reason: 'x'.repeat(501) })
          .length,
      ).toBeGreaterThan(0);
    });
  });

  describe('controlador', () => {
    it('confirm y complete exigen ADMINISTRADOR; cancel y reschedule heredan los 3 roles', () => {
      const proto = AppointmentsController.prototype;
      expect(Reflect.getMetadata(ROLES_KEY, proto.confirmAppointment)).toEqual([
        Role.ADMINISTRADOR,
      ]);
      expect(Reflect.getMetadata(ROLES_KEY, proto.completeAppointment)).toEqual(
        [Role.ADMINISTRADOR],
      );
      expect(
        Reflect.getMetadata(ROLES_KEY, proto.cancelAppointment),
      ).toBeUndefined();
      expect(Reflect.getMetadata(ROLES_KEY, AppointmentsController)).toEqual([
        Role.ADMINISTRADOR,
        Role.ASISTENTE,
        Role.PACIENTE,
      ]);
    });
  });
});
