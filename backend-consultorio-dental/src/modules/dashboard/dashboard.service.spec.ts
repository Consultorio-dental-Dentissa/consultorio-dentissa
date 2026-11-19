import 'reflect-metadata';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { ROLES_KEY } from 'src/infrastructure/security/decorators/roles.decorator';
import { Role } from '../users/enums/rol.enum';

describe('DashboardService', () => {
  let repo: any;
  let service: DashboardService;
  let prisma: any;
  let txOptions: unknown;
  const tx = { marker: 'tx' };

  beforeEach(() => {
    repo = {
      countAppointmentsByStatus: jest
        .fn()
        .mockImplementation(async (range?: unknown) =>
          range
            ? [
                { status: 'PENDIENTE', count: 2 },
                { status: 'CONFIRMADA', count: 1 },
              ]
            : [
                { status: 'PENDIENTE', count: 5 },
                { status: 'COMPLETADA', count: 7 },
              ],
        ),
      countPatients: jest.fn().mockResolvedValue({ total: 10, active: 9 }),
      countServices: jest.fn().mockResolvedValue({ total: 6, active: 4 }),
      getUpcomingAppointments: jest.fn().mockResolvedValue([
        {
          id: 1,
          scheduled_at: new Date(),
          durationMinutes: 30,
          status: 'PENDIENTE',
          service: { name: 'Limpieza' },
          patient: { user: { name: 'Ana', lastname: 'Paz' } },
        },
      ]),
    };
    prisma = {
      $transaction: jest.fn((cb: any, opts: unknown) => {
        txOptions = opts;
        return cb(tx);
      }),
    };
    service = new DashboardService(repo, prisma);
  });

  it('calcula citas de hoy por estado (con ceros) y totales globales', async () => {
    const stats = await service.getStats();

    expect(stats.appointments.today.total).toBe(3);
    expect(stats.appointments.today.byStatus).toEqual({
      PENDIENTE: 2,
      CONFIRMADA: 1,
      COMPLETADA: 0,
      CANCELADA: 0,
      REPROGRAMADA: 0,
    });
    expect(stats.appointments.total).toBe(12);
    expect(stats.appointments.byStatus.COMPLETADA).toBe(7);
    expect(stats.patients).toEqual({ total: 10, active: 9 });
    expect(stats.services).toEqual({ total: 6, active: 4 });
  });

  it('usa el dia local de 24h (zona APP_TIMEZONE) y limita las proximas citas', async () => {
    const stats = await service.getStats();
    const { from, to } = stats.appointments.today;
    expect(to.getTime() - from.getTime()).toBeGreaterThanOrEqual(23 * 3600_000);
    expect(to.getTime() - from.getTime()).toBeLessThanOrEqual(25 * 3600_000);
    expect(from.getTime()).toBeLessThanOrEqual(Date.now());
    expect(to.getTime()).toBeGreaterThan(Date.now());
    expect(repo.getUpcomingAppointments.mock.calls[0][1]).toBe(10);
  });

  it('lee todo en una transaccion RepeatableRead', async () => {
    await service.getStats();
    expect(txOptions).toEqual({ isolationLevel: 'RepeatableRead' });
    expect(repo.countPatients).toHaveBeenCalledWith(tx);
    expect(repo.countAppointmentsByStatus.mock.calls[0][1]).toBe(tx);
  });

  it('no expone datos sensibles de las proximas citas', async () => {
    const stats = await service.getStats();
    expect(stats.appointments.upcoming[0]).toEqual({
      id: 1,
      scheduled_at: expect.any(Date),
      durationMinutes: 30,
      status: 'PENDIENTE',
      patient: { name: 'Ana', lastname: 'Paz' },
      service: { name: 'Limpieza' },
    });
  });

  it('el endpoint es solo para ADMINISTRADOR', () => {
    expect(Reflect.getMetadata(ROLES_KEY, DashboardController)).toEqual([
      Role.ADMINISTRADOR,
    ]);
  });
});
