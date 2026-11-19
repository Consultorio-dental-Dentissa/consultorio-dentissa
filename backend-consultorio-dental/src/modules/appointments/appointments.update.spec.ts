import 'reflect-metadata';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { AppointmentsService } from './appointments.service';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { Role } from '../users/enums/rol.enum';

describe('AppointmentsService.updateAppointment (PATCH /appointments/:id)', () => {
  const admin = { id: 1, role: Role.ADMINISTRADOR };
  const assistant = { id: 2, role: Role.ASISTENTE };
  const patientUser = { id: 5, role: Role.PACIENTE };
  const tx = { marker: 'tx' };
  const futureDate = () => new Date(Date.now() + 10 * 86_400_000);
  const base = () => ({
    id: 7,
    scheduled_at: futureDate(),
    durationMinutes: 30,
    status: 'PENDIENTE',
    notes: 'nota original',
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

  const withAppointment = (over: object) =>
    appointments.getByIdWithOwner.mockResolvedValue({ ...base(), ...over });

  beforeEach(() => {
    appointments = {
      getByIdWithOwner: jest.fn().mockResolvedValue(base()),
      updateIfStatus: jest.fn().mockResolvedValue(true),
      getAppointmentsByDate: jest.fn().mockResolvedValue([]),
      getActiveAdminIds: jest.fn().mockResolvedValue([1, 9]),
      createNotifications: jest.fn().mockResolvedValue(undefined),
      getById: jest.fn().mockResolvedValue({ id: 7, notes: 'x' }),
    };
    services = {
      getById: jest
        .fn()
        .mockResolvedValue({ id: 2, status: true, durationMinutes: 60 }),
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

  it('sin campos: 400 sin abrir transaccion', async () => {
    await expect(service.updateAppointment(7, {}, admin)).rejects.toThrow(
      BadRequestException,
    );
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('404 si la cita no existe', async () => {
    appointments.getByIdWithOwner.mockResolvedValue(null);
    await expect(
      service.updateAppointment(7, { notes: 'a' }, admin),
    ).rejects.toThrow(NotFoundException);
  });

  describe('permisos por rol y estado', () => {
    it.each(['PENDIENTE', 'CONFIRMADA', 'REPROGRAMADA'])(
      'ADMIN y ASISTENTE editan notas de una cita %s',
      async (status) => {
        withAppointment({ status });
        await service.updateAppointment(7, { notes: 'nueva' }, admin);
        await service.updateAppointment(7, { notes: 'nueva' }, assistant);
        expect(appointments.updateIfStatus).toHaveBeenCalledTimes(2);
        expect(appointments.updateIfStatus).toHaveBeenCalledWith(
          7,
          status,
          { notes: 'nueva' },
          tx,
        );
      },
    );

    it.each(['COMPLETADA', 'CANCELADA'])(
      '%s: 409 para ADMIN, ASISTENTE y PACIENTE',
      async (status) => {
        withAppointment({ status });
        for (const who of [admin, assistant, patientUser]) {
          await expect(
            service.updateAppointment(7, { notes: 'n' }, who),
          ).rejects.toThrow(ConflictException);
        }
        expect(appointments.updateIfStatus).not.toHaveBeenCalled();
        expect(audit.log).not.toHaveBeenCalled();
      },
    );

    it('PACIENTE edita su cita PENDIENTE futura', async () => {
      await service.updateAppointment(7, { notes: 'mi nota' }, patientUser);
      expect(appointments.updateIfStatus).toHaveBeenCalled();
    });

    it('PACIENTE edita su cita REPROGRAMADA futura', async () => {
      withAppointment({ status: 'REPROGRAMADA' });
      await service.updateAppointment(7, { notes: 'mi nota' }, patientUser);
      expect(appointments.updateIfStatus).toHaveBeenCalled();
    });

    it('PACIENTE no puede editar una cita CONFIRMADA (403)', async () => {
      withAppointment({ status: 'CONFIRMADA' });
      await expect(
        service.updateAppointment(7, { notes: 'n' }, patientUser),
      ).rejects.toThrow(ForbiddenException);
      expect(appointments.updateIfStatus).not.toHaveBeenCalled();
    });

    it('PACIENTE: una cita ajena responde 404', async () => {
      withAppointment({ patient_id: 99 });
      await expect(
        service.updateAppointment(7, { notes: 'n' }, patientUser),
      ).rejects.toThrow(NotFoundException);
    });

    it('PACIENTE: el patient_id sale del usuario autenticado', async () => {
      await service.updateAppointment(7, { notes: 'n' }, patientUser);
      expect(patients.getIdByUserId).toHaveBeenCalledWith(5, tx);
    });

    it('PACIENTE no puede editar una cita cuya fecha ya paso (409)', async () => {
      withAppointment({ scheduled_at: new Date(Date.now() - 3_600_000) });
      await expect(
        service.updateAppointment(7, { notes: 'n' }, patientUser),
      ).rejects.toThrow(ConflictException);
    });

    it('staff si puede editar una cita pasada aun no completada', async () => {
      withAppointment({
        scheduled_at: new Date(Date.now() - 3_600_000),
        status: 'CONFIRMADA',
      });
      await service.updateAppointment(7, { notes: 'n' }, assistant);
      expect(appointments.updateIfStatus).toHaveBeenCalled();
    });
  });

  describe('cambio de servicio', () => {
    it('toma la nueva duracion, revalida solape excluyendo la propia cita', async () => {
      await service.updateAppointment(7, { service_id: 2 }, admin);
      const [, , excludeId, usedTx] =
        appointments.getAppointmentsByDate.mock.calls[0];
      expect(excludeId).toBe(7);
      expect(usedTx).toBe(tx);
      expect(appointments.updateIfStatus).toHaveBeenCalledWith(
        7,
        'PENDIENTE',
        { service_id: 2, durationMinutes: 60 },
        tx,
      );
      // el rango consultado usa la duracion nueva (60 min)
      const [from, to] = appointments.getAppointmentsByDate.mock.calls[0];
      expect(to.getTime() - from.getTime()).toBe(60 * 60_000);
    });

    it('solape con otra cita: 409 y sin escritura', async () => {
      const start = futureDate();
      withAppointment({ scheduled_at: start });
      appointments.getAppointmentsByDate.mockResolvedValue([
        {
          scheduled_at: new Date(start.getTime() + 40 * 60_000),
          durationMinutes: 30,
        },
      ]);
      await expect(
        service.updateAppointment(7, { service_id: 2 }, admin),
      ).rejects.toThrow(ConflictException);
      expect(appointments.updateIfStatus).not.toHaveBeenCalled();
      expect(audit.log).not.toHaveBeenCalled();
    });

    it('servicio inexistente: 404', async () => {
      services.getById.mockResolvedValue(null);
      await expect(
        service.updateAppointment(7, { service_id: 2 }, admin),
      ).rejects.toThrow(NotFoundException);
    });

    it('servicio inactivo: 400', async () => {
      services.getById.mockResolvedValue({
        id: 2,
        status: false,
        durationMinutes: 60,
      });
      await expect(
        service.updateAppointment(7, { service_id: 2 }, admin),
      ).rejects.toThrow(BadRequestException);
      expect(appointments.updateIfStatus).not.toHaveBeenCalled();
    });

    it('el mismo servicio no es un cambio (sin consulta de servicio)', async () => {
      await service.updateAppointment(7, { service_id: 1 }, admin);
      expect(services.getById).not.toHaveBeenCalled();
      expect(appointments.updateIfStatus).not.toHaveBeenCalled();
    });

    it('no muta la fecha original de la cita', async () => {
      const original = futureDate();
      const snapshot = original.getTime();
      withAppointment({ scheduled_at: original });
      await service.updateAppointment(7, { service_id: 2 }, admin);
      expect(original.getTime()).toBe(snapshot);
    });

    it('la actualizacion condicional fallida (estado cambio) es 409', async () => {
      appointments.updateIfStatus.mockResolvedValue(false);
      await expect(
        service.updateAppointment(7, { notes: 'x' }, admin),
      ).rejects.toThrow(ConflictException);
      expect(audit.log).not.toHaveBeenCalled();
    });
  });

  describe('notificacion y auditoria', () => {
    it('staff edita: notifica al paciente con mensaje generico (sin notas)', async () => {
      await service.updateAppointment(7, { notes: 'texto privado' }, admin);
      const [rows, usedTx] = appointments.createNotifications.mock.calls[0];
      expect(rows).toHaveLength(1);
      expect(rows[0].user_id).toBe(5);
      expect(rows[0].type).toBe('CITA_ACTUALIZADA');
      expect(JSON.stringify(rows)).not.toContain('texto privado');
      expect(usedTx).toBe(tx);
    });

    it('paciente edita: notifica a los administradores activos', async () => {
      await service.updateAppointment(
        7,
        { notes: 'texto privado' },
        patientUser,
      );
      const [rows] = appointments.createNotifications.mock.calls[0];
      expect(rows.map((r: any) => r.user_id)).toEqual([1, 9]);
      expect(JSON.stringify(rows)).not.toContain('texto privado');
    });

    it('audita APPOINTMENT_UPDATED con changedFields y sin contenido de notas', async () => {
      await service.updateAppointment(
        7,
        { notes: 'texto privado', service_id: 2 },
        admin,
      );
      const [entry, usedTx] = audit.log.mock.calls[0];
      expect(entry).toEqual({
        userId: 1,
        action: 'APPOINTMENT_UPDATED',
        entity: 'APPOINTMENT',
        entityId: 7,
        after: { changedFields: ['notes', 'service_id'] },
      });
      expect(JSON.stringify(entry)).not.toContain('texto privado');
      expect(usedTx).toBe(tx);
    });

    it('sin cambios reales: sin escritura, notificacion ni auditoria, devuelve detalle', async () => {
      const result = await service.updateAppointment(
        7,
        { notes: 'nota original', service_id: 1 },
        admin,
      );
      expect(appointments.updateIfStatus).not.toHaveBeenCalled();
      expect(appointments.createNotifications).not.toHaveBeenCalled();
      expect(audit.log).not.toHaveBeenCalled();
      expect(result).toMatchObject({ id: 7 });
    });

    it('la respuesta oculta consultation_id a no-ADMIN y lo expone a ADMIN', async () => {
      appointments.getById.mockResolvedValue({
        id: 7,
        consultation: { id: 44 },
      });
      const asAdmin = await service.updateAppointment(7, { notes: 'a' }, admin);
      const asStaff = await service.updateAppointment(
        7,
        { notes: 'a' },
        assistant,
      );
      expect((asAdmin as any).consultation_id).toBe(44);
      expect((asStaff as any).consultation_id).toBeNull();
    });
  });
});

describe('UpdateAppointmentDto', () => {
  const errors = (plain: object) =>
    validateSync(plainToInstance(UpdateAppointmentDto, plain)).map(
      (e) => Object.values(e.constraints ?? {})[0],
    );

  it('valida servicio y notas con mensajes en español', () => {
    expect(errors({ service_id: 'x' })).toContain(
      'El ID del servicio debe ser un número entero',
    );
    expect(errors({ notes: '   ' })).toContain(
      'La nota de la cita no puede estar vacía',
    );
    expect(errors({ notes: 'a'.repeat(301) })).toContain(
      'La nota de la cita debe tener maximo 300 caracteres',
    );
    expect(errors({ notes: null }).length).toBeGreaterThan(0);
    expect(errors({ service_id: 3, notes: 'ok' })).toHaveLength(0);
  });
});
