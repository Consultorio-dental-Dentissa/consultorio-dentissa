import { PatientsRepository } from './repositories/patients.repository';

describe('PatientsRepository - next_appointment_at', () => {
  it('usa UNA consulta agregada para toda la pagina y devuelve null sin cita', async () => {
    const next = new Date('2030-01-01T10:00:00Z');
    const prisma: any = {
      patient: {
        findMany: jest.fn().mockResolvedValue([
          { id: 1, user_id: 11 },
          { id: 2, user_id: 12 },
        ]),
        count: jest.fn().mockResolvedValue(2),
      },
      appointment: {
        groupBy: jest
          .fn()
          .mockResolvedValue([{ patient_id: 1, _min: { scheduled_at: next } }]),
      },
    };
    const repo = new PatientsRepository(prisma);
    const { items } = await repo.getAll({} as any, 'reduced');

    expect(prisma.appointment.groupBy).toHaveBeenCalledTimes(1);
    const args = prisma.appointment.groupBy.mock.calls[0][0];
    expect(args.where.patient_id).toEqual({ in: [1, 2] });
    expect(args.where.status.in).toEqual([
      'PENDIENTE',
      'CONFIRMADA',
      'REPROGRAMADA',
    ]);
    expect(args.where.scheduled_at.gt).toBeInstanceOf(Date);
    expect(items[0]).toMatchObject({ user_id: 11, next_appointment_at: next });
    expect(items[1].next_appointment_at).toBeNull();
  });

  it('sin pacientes no consulta citas', async () => {
    const prisma: any = {
      patient: {
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
      },
      appointment: { groupBy: jest.fn() },
    };
    await new PatientsRepository(prisma).getAll({} as any);
    expect(prisma.appointment.groupBy).not.toHaveBeenCalled();
  });
});
