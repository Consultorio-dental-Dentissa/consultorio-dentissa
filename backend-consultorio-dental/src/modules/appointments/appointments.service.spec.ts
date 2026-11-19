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
import { AppointmentsRepository } from './repositories/appointments.repository';
import { GetAppointmentsDto } from './dto/get-appointment.dto';
import { Role } from '../users/enums/rol.enum';

describe('AppointmentsService - propiedad de las citas', () => {
  const patientUser = { id: 5, role: Role.PACIENTE };
  const assistant = { id: 2, role: Role.ASISTENTE };

  let appointments: any;
  let services: any;
  let patients: any;
  let prisma: any;
  let audit: any;
  const tx = { marker: 'tx' };
  let service: AppointmentsService;

  beforeEach(() => {
    appointments = {
      getAll: jest.fn().mockResolvedValue({ items: [], total: 0 }),
      getById: jest.fn(),
      getAppointmentsByDate: jest.fn().mockResolvedValue([]),
      create: jest.fn().mockResolvedValue({
        id: 1,
        scheduled_at: new Date(),
        durationMinutes: 30,
        status: 'PENDIENTE',
        notes: 'n',
        created_at: new Date(),
        patient: { user: { name: 'A', lastname: 'B' } },
        service: { name: 'S' },
      }),
    };
    services = {
      getById: jest
        .fn()
        .mockResolvedValue({ id: 1, durationMinutes: 30, status: true }),
    };
    patients = {
      getIdByUserId: jest.fn().mockResolvedValue(10),
      getUserStatusByPatientId: jest.fn().mockResolvedValue(true),
    };
    prisma = {
      $transaction: jest.fn((work: (tx: unknown) => unknown) => work(tx)),
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

  it('el listado de un PACIENTE se fuerza a su patient_id, ignorando el filtro del cliente', async () => {
    await service.getAllAppointments({ patient_id: 99 } as any, patientUser);
    expect(appointments.getAll.mock.calls[0][0].patient_id).toBe(10);
  });

  it('el listado de un ASISTENTE respeta el filtro enviado', async () => {
    await service.getAllAppointments({ patient_id: 99 } as any, assistant);
    expect(appointments.getAll.mock.calls[0][0].patient_id).toBe(99);
    expect(patients.getIdByUserId).not.toHaveBeenCalled();
  });

  it('un PACIENTE sin ficha de paciente es rechazado', async () => {
    patients.getIdByUserId.mockResolvedValue(null);
    await expect(
      service.getAllAppointments({} as any, patientUser),
    ).rejects.toThrow(ForbiddenException);
  });

  it('un PACIENTE no ve una cita ajena (404)', async () => {
    appointments.getById.mockResolvedValue({ id: 7, patient_id: 11 });
    await expect(service.getAppointmentById(7, patientUser)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('un PACIENTE ve su propia cita', async () => {
    appointments.getById.mockResolvedValue({ id: 7, patient_id: 10 });
    await expect(
      service.getAppointmentById(7, patientUser),
    ).resolves.toMatchObject({ id: 7 });
  });

  it('un ASISTENTE ve cualquier cita', async () => {
    appointments.getById.mockResolvedValue({ id: 7, patient_id: 11 });
    await expect(
      service.getAppointmentById(7, assistant),
    ).resolves.toMatchObject({ id: 7 });
  });

  describe('consultation_id (dato clinico, solo ADMIN)', () => {
    const admin = { id: 1, role: Role.ADMINISTRADOR };
    const row = {
      id: 7,
      patient_id: 11,
      consultation: { id: 33 },
      patient: { user: { name: 'A', lastname: 'B' } },
      service: { name: 'S' },
    };

    it('ADMIN recibe consultation_id en detalle y listado y se pide al repositorio', async () => {
      appointments.getById.mockResolvedValue(row);
      const detail: any = await service.getAppointmentById(7, admin);
      expect(detail.consultation_id).toBe(33);
      expect(detail.consultation).toBeUndefined();
      expect(appointments.getById).toHaveBeenCalledWith(7, {
        includeConsultation: true,
      });

      appointments.getAll.mockResolvedValue({ items: [row], total: 1 });
      const list = await service.getAllAppointments({} as any, admin);
      expect(list.items[0].consultation_id).toBe(33);
      expect(appointments.getAll.mock.calls[0][2]).toEqual({
        includeConsultation: true,
      });
    });

    it('ADMIN sin consulta recibe null', async () => {
      appointments.getById.mockResolvedValue({ ...row, consultation: null });
      const detail: any = await service.getAppointmentById(7, admin);
      expect(detail.consultation_id).toBeNull();
    });

    it('ASISTENTE y PACIENTE reciben null aunque el repositorio devolviera la relacion', async () => {
      appointments.getById.mockResolvedValue({ ...row, patient_id: 10 });
      appointments.getAll.mockResolvedValue({ items: [row], total: 1 });
      for (const user of [assistant, patientUser]) {
        const detail: any = await service.getAppointmentById(7, user);
        expect(detail.consultation_id).toBeNull();
        expect(detail.consultation).toBeUndefined();
        const list = await service.getAllAppointments({} as any, user);
        expect(list.items[0].consultation_id).toBeNull();
      }
      expect(appointments.getById.mock.calls[0][1]).toEqual({
        includeConsultation: false,
      });
    });

    it('completed_without_consultation: ADMIN ok; ASISTENTE y PACIENTE 403', async () => {
      await service.getAllAppointments(
        { completed_without_consultation: true } as any,
        admin,
      );
      expect(
        appointments.getAll.mock.calls[0][0].completed_without_consultation,
      ).toBe(true);
      for (const user of [assistant, patientUser]) {
        await expect(
          service.getAllAppointments(
            { completed_without_consultation: true } as any,
            user,
          ),
        ).rejects.toThrow(ForbiddenException);
      }
    });

    it('completed_without_consultation con otro status es 400', async () => {
      await expect(
        service.getAllAppointments(
          { completed_without_consultation: true, status: 'PENDIENTE' } as any,
          admin,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('el repositorio filtra COMPLETADA sin consulta', async () => {
      const findMany = jest.fn().mockResolvedValue([]);
      const count = jest.fn().mockResolvedValue(0);
      const repository = new AppointmentsRepository({
        appointment: { findMany, count },
      } as any);
      await repository.getAll(
        { completed_without_consultation: true } as any,
        undefined,
        { includeConsultation: true },
      );
      const args = findMany.mock.calls[0][0];
      expect(args.where.status).toBe('COMPLETADA');
      expect(args.where.consultation).toEqual({ is: null });
      expect(args.select.consultation).toEqual({ select: { id: true } });
    });

    it('el DTO convierte "true"/"false" y rechaza otros valores', () => {
      const ok = plainToInstance(GetAppointmentsDto, {
        completed_without_consultation: 'true',
      });
      expect(ok.completed_without_consultation).toBe(true);
      expect(validateSync(ok)).toHaveLength(0);
      const bad = plainToInstance(GetAppointmentsDto, {
        completed_without_consultation: 'si',
      });
      expect(validateSync(bad)).not.toHaveLength(0);
    });
  });

  it('al crear, un PACIENTE usa su propio patient_id aunque el body envie otro', async () => {
    await service.createAppoinment(
      {
        patient_id: 99,
        service_id: 1,
        notes: 'n',
        scheduled_at: new Date(Date.now() + 86400000),
      } as any,
      patientUser,
    );
    expect(appointments.create.mock.calls[0][0].patient_id).toBe(10);
    expect(patients.getIdByUserId).toHaveBeenCalledWith(5, tx);
    expect(patients.getUserStatusByPatientId).toHaveBeenCalledWith(10, tx);
    expect(services.getById).toHaveBeenCalledWith(1, tx);
  });

  it('un ASISTENTE debe indicar el patient_id al crear', async () => {
    await expect(
      service.createAppoinment(
        { service_id: 1, notes: 'n', scheduled_at: new Date() } as any,
        assistant,
      ),
    ).rejects.toThrow(BadRequestException);
  });

  describe('creacion de citas', () => {
    // 2030-01-10 16:00 UTC = 10:00 en America/Mexico_City (UTC-6)
    const at = (utcHour: number, minute = 0) =>
      new Date(Date.UTC(2030, 0, 10, utcHour, minute));
    const dto = (scheduled_at: Date) =>
      ({
        patient_id: 10,
        service_id: 1,
        notes: 'n',
        scheduled_at,
      }) as any;
    const p2034 = () =>
      new Prisma.PrismaClientKnownRequestError('x', {
        code: 'P2034',
        clientVersion: 't',
      });

    it('crea la cita en una transaccion Serializable y lee los choques con el mismo tx', async () => {
      await service.createAppoinment(dto(at(16)), assistant);

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(prisma.$transaction.mock.calls[0][1]).toEqual({
        isolationLevel: 'Serializable',
      });
      expect(appointments.getAppointmentsByDate.mock.calls[0][3]).toBe(tx);
      expect(appointments.create.mock.calls[0][1]).toBe(tx);
    });

    it('usa la duracion del servicio (no la enviada por el cliente)', async () => {
      await service.createAppoinment(
        { ...dto(at(16)), durationMinutes: 1 },
        assistant,
      );
      expect(appointments.create.mock.calls[0][0].durationMinutes).toBe(30);
    });

    it('reintenta si Postgres aborta por serializacion (P2034)', async () => {
      prisma.$transaction
        .mockRejectedValueOnce(p2034())
        .mockImplementationOnce((work: (tx: unknown) => unknown) => work(tx));

      await expect(
        service.createAppoinment(dto(at(16)), assistant),
      ).resolves.toMatchObject({ id: 1 });
      expect(prisma.$transaction).toHaveBeenCalledTimes(2);
    });

    it('tras agotar los reintentos P2034 responde 409', async () => {
      prisma.$transaction.mockRejectedValue(p2034());

      await expect(
        service.createAppoinment(dto(at(16)), assistant),
      ).rejects.toThrow(ConflictException);
      expect(prisma.$transaction).toHaveBeenCalledTimes(3);
    });

    it('rechaza con 409 un traslape y formatea la hora en la zona del consultorio', async () => {
      // Existente 16:00-16:30 UTC = 10:00-10:30 en Ciudad de Mexico
      appointments.getAppointmentsByDate.mockResolvedValue([
        { scheduled_at: at(16), durationMinutes: 30 },
      ]);

      const attempt = service.createAppoinment(dto(at(16, 15)), assistant);

      await expect(attempt).rejects.toThrow(ConflictException);
      await expect(attempt).rejects.toThrow(/10:00 a 10:30/);
      expect(appointments.create).not.toHaveBeenCalled();
    });

    it('permite citas consecutivas (solape estricto)', async () => {
      appointments.getAppointmentsByDate.mockResolvedValue([
        { scheduled_at: at(16), durationMinutes: 30 },
      ]);

      // Empieza exactamente cuando termina la existente
      await expect(
        service.createAppoinment(dto(at(16, 30)), assistant),
      ).resolves.toBeDefined();
      // Termina exactamente cuando empieza la existente
      await expect(
        service.createAppoinment(dto(at(15, 30)), assistant),
      ).resolves.toBeDefined();
    });

    it('detecta una cita nueva que envuelve a una existente', async () => {
      appointments.getAppointmentsByDate.mockResolvedValue([
        { scheduled_at: at(16, 10), durationMinutes: 10 },
      ]);
      services.getById.mockResolvedValue({
        id: 1,
        durationMinutes: 60,
        status: true,
      });

      await expect(
        service.createAppoinment(dto(at(16)), assistant),
      ).rejects.toThrow(ConflictException);
    });

    it('no muta las fechas recibidas al buscar choques', async () => {
      const existing = { scheduled_at: at(16), durationMinutes: 30 };
      appointments.getAppointmentsByDate.mockResolvedValue([existing]);
      const requested = at(18);

      await service.createAppoinment(dto(requested), assistant);

      expect(existing.scheduled_at.getTime()).toBe(at(16).getTime());
      expect(requested.getTime()).toBe(at(18).getTime());
    });

    it('rechaza una fecha pasada en el service (400) sin abrir transaccion', async () => {
      await expect(
        service.createAppoinment(dto(new Date(Date.now() - 60_000)), assistant),
      ).rejects.toThrow(BadRequestException);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('detecta un choque con una cita que cruza la medianoche local (busqueda por intervalo)', async () => {
      // Existente 23:30-00:30 hora de Mexico (05:30-06:30 UTC del dia siguiente)
      const existing = {
        scheduled_at: new Date(Date.UTC(2030, 0, 11, 5, 30)),
        durationMinutes: 60,
      };
      appointments.getAppointmentsByDate.mockResolvedValue([existing]);

      // Nueva 00:10 hora de Mexico (06:10 UTC): otro dia local que la existente
      await expect(
        service.createAppoinment(
          dto(new Date(Date.UTC(2030, 0, 11, 6, 10))),
          assistant,
        ),
      ).rejects.toThrow(ConflictException);

      const [start, end] = appointments.getAppointmentsByDate.mock.calls[0];
      expect(end.getTime() - start.getTime()).toBe(30 * 60_000);
    });

    it('sin usuario autenticado responde 401 y no toca la BD', async () => {
      await expect(
        service.createAppoinment(dto(at(16)), undefined as any),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        service.getAllAppointments({} as any, undefined as any),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        service.getAppointmentById(1, undefined as any),
      ).rejects.toThrow(UnauthorizedException);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it.each([
      [
        'nombre de la restriccion en message',
        new Error('violates exclusion constraint "appointments_no_overlap"'),
      ],
      [
        'SQLSTATE 23P01 en code',
        Object.assign(new Error('boom'), { code: '23P01' }),
      ],
      [
        'SQLSTATE 23P01 en meta (Prisma)',
        new Prisma.PrismaClientKnownRequestError('x', {
          code: 'P2010',
          clientVersion: 't',
          meta: { code: '23P01', message: 'conflicting key value' },
        }),
      ],
      [
        'SQLSTATE 23P01 en cause anidado',
        new Error('wrapper', {
          cause: { originalCode: 'x', cause: { code: '23P01' } },
        }),
      ],
      [
        'nombre de la restriccion en meta anidado',
        Object.assign(new Error('driver'), {
          meta: {
            driverAdapterError: {
              cause: { constraint: 'appointments_no_overlap' },
            },
          },
        }),
      ],
    ])('mapea a 409 la violacion EXCLUDE: %s', async (_name, error) => {
      prisma.$transaction.mockRejectedValue(error);
      await expect(
        service.createAppoinment(dto(at(16)), assistant),
      ).rejects.toThrow(ConflictException);
      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    });

    it('un error no relacionado se propaga tal cual', async () => {
      const other = new Error('otro error');
      prisma.$transaction.mockRejectedValue(other);
      await expect(
        service.createAppoinment(dto(at(16)), assistant),
      ).rejects.toBe(other);
    });

    it('rechaza un servicio inactivo con 400', async () => {
      services.getById.mockResolvedValue({
        id: 1,
        durationMinutes: 30,
        status: false,
      });
      await expect(
        service.createAppoinment(dto(at(16)), assistant),
      ).rejects.toThrow(BadRequestException);
    });

    it('rechaza un paciente cuyo usuario esta inactivo con 400', async () => {
      patients.getUserStatusByPatientId.mockResolvedValue(false);
      await expect(
        service.createAppoinment(dto(at(16)), assistant),
      ).rejects.toThrow(BadRequestException);
    });

    it('un paciente inexistente responde 404', async () => {
      patients.getUserStatusByPatientId.mockResolvedValue(null);
      await expect(
        service.createAppoinment(dto(at(16)), assistant),
      ).rejects.toThrow(NotFoundException);
    });
  });
});

describe('AppointmentsRepository - choques', () => {
  it('considera PENDIENTE, CONFIRMADA y REPROGRAMADA (legacy), busca por intervalo y usa la duracion guardada', async () => {
    const findMany = jest
      .fn()
      .mockResolvedValue([{ scheduled_at: new Date(), durationMinutes: 45 }]);
    const repository = new AppointmentsRepository({
      appointment: { findMany },
    } as any);

    const start = new Date(Date.UTC(2030, 0, 10, 5, 30));
    const end = new Date(Date.UTC(2030, 0, 10, 6, 30));
    const result = await repository.getAppointmentsByDate(start, end);
    const args = findMany.mock.calls[0][0];

    expect(args.where.status).toEqual({
      in: ['PENDIENTE', 'CONFIRMADA', 'REPROGRAMADA'],
    });
    // Intervalo: empieza antes de `end` y no antes de start - 24h
    expect(args.where.scheduled_at.lt).toEqual(end);
    expect(args.where.scheduled_at.gte).toEqual(
      new Date(start.getTime() - 24 * 3_600_000),
    );
    expect(args.select.durationMinutes).toBe(true);
    expect(args.select.service).toBeUndefined();
    expect(result[0].durationMinutes).toBe(45);
  });

  it('getById usa select explicito sin cancelled_by_id ni campos internos', async () => {
    const findFirst = jest.fn().mockResolvedValue(null);
    const repository = new AppointmentsRepository({
      appointment: { findFirst },
    } as any);

    await repository.getById(1);
    const select = findFirst.mock.calls[0][0].select;

    expect(select).toBeDefined();
    expect(select.cancelled_by_id).toBeUndefined();
    expect(select.cancel_reason).toBe(true);
    expect(select.service.select.name).toBe(true);
    expect(select.patient.select.user.select).toEqual({
      name: true,
      lastname: true,
    });
  });
});

describe('GetAppointmentsDto', () => {
  it('un status repetido (array) da error de validacion, no excepcion', () => {
    const run = () =>
      validateSync(
        plainToInstance(GetAppointmentsDto, { status: ['PENDIENTE', 'x'] }),
      );

    expect(run).not.toThrow();
    expect(run().length).toBeGreaterThan(0);
  });

  it('normaliza el status a mayusculas y limita limit a 100', () => {
    const ok = plainToInstance(GetAppointmentsDto, {
      status: 'pendiente',
      limit: '100',
    });
    expect(validateSync(ok)).toHaveLength(0);
    expect(ok.status).toBe('PENDIENTE');

    const tooBig = plainToInstance(GetAppointmentsDto, { limit: '101' });
    expect(validateSync(tooBig).length).toBeGreaterThan(0);
  });
});

describe('GetAppointments - rango from/to y sort', () => {
  let appointments: any;
  let service: AppointmentsService;
  const admin = { id: 1, role: Role.ADMINISTRADOR };
  const patientUser = { id: 5, role: Role.PACIENTE };

  beforeEach(() => {
    appointments = {
      getAll: jest.fn().mockResolvedValue({ items: [], total: 0 }),
    };
    const patients: any = {
      getIdByUserId: jest.fn().mockResolvedValue(10),
    };
    service = new AppointmentsService(
      appointments,
      {} as any,
      patients,
      {} as any,
      {} as any,
    );
  });

  it('from es inicio del dia y to fin del dia inclusive', async () => {
    await service.getAllAppointments(
      { from: '2026-03-10', to: '2026-03-10' } as any,
      admin,
    );
    const range = appointments.getAll.mock.calls[0][1];
    expect(range.from).toBeInstanceOf(Date);
    expect(range.to.getTime()).toBeGreaterThan(range.from.getTime());
    expect(range.to.getTime() - range.from.getTime()).toBeGreaterThan(
      23 * 3_600_000,
    );
  });

  it('from posterior a to da 400', async () => {
    await expect(
      service.getAllAppointments(
        { from: '2026-03-11', to: '2026-03-10' } as any,
        admin,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('fecha imposible da 400 (service) y error de validacion (DTO)', async () => {
    await expect(
      service.getAllAppointments({ from: '2026-02-31' } as any, admin),
    ).rejects.toBeInstanceOf(BadRequestException);
    const dto = plainToInstance(GetAppointmentsDto, { to: '2026-02-31' });
    expect(validateSync(dto).length).toBeGreaterThan(0);
  });

  it('sort solo acepta asc|desc', () => {
    expect(
      validateSync(plainToInstance(GetAppointmentsDto, { sort: 'asc' })),
    ).toHaveLength(0);
    expect(
      validateSync(plainToInstance(GetAppointmentsDto, { sort: 'x' })).length,
    ).toBeGreaterThan(0);
  });

  it('un PACIENTE con rango sigue forzado a su patient_id', async () => {
    await service.getAllAppointments(
      { from: '2026-03-10', patient_id: 99 } as any,
      patientUser,
    );
    expect(appointments.getAll.mock.calls[0][0].patient_id).toBe(10);
  });
});

describe('AppointmentsRepository.getAll - sort y rango', () => {
  it('aplica rango en scheduled_at y sort asc', async () => {
    const prisma: any = {
      appointment: {
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
      },
    };
    const repo = new AppointmentsRepository(prisma);
    const from = new Date('2026-03-10T06:00:00Z');
    const to = new Date('2026-03-11T05:59:59Z');
    await repo.getAll({ sort: 'asc' } as any, { from, to });
    const args = prisma.appointment.findMany.mock.calls[0][0];
    expect(args.where.scheduled_at).toEqual({ gte: from, lte: to });
    expect(args.orderBy[0]).toEqual({ scheduled_at: 'asc' });
  });
});
