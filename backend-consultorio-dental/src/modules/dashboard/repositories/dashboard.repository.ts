import { Injectable } from '@nestjs/common';
import { AppointmentStatus, Prisma } from '@prisma/client';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

@Injectable()
export class DashboardRepository {
  constructor(private prisma: PrismaService) {}

  /** Citas agrupadas por estado dentro de [start, end) (sin rango = todas). */
  async countAppointmentsByStatus(
    range?: { start: Date; end: Date },
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;
    const groups = await client.appointment.groupBy({
      by: ['status'],
      where: range ? { scheduled_at: { gte: range.start, lt: range.end } } : {},
      _count: { _all: true },
    });

    return groups.map((g) => ({ status: g.status, count: g._count._all }));
  }

  async countPatients(tx?: Prisma.TransactionClient) {
    const client = tx ?? this.prisma;
    const [total, active] = await Promise.all([
      client.patient.count(),
      client.patient.count({ where: { user: { status: true } } }),
    ]);

    return { total, active };
  }

  async countServices(tx?: Prisma.TransactionClient) {
    const client = tx ?? this.prisma;
    const [total, active] = await Promise.all([
      client.service.count(),
      client.service.count({ where: { status: true } }),
    ]);

    return { total, active };
  }

  async getUpcomingAppointments(
    from: Date,
    take: number,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;
    return await client.appointment.findMany({
      where: {
        scheduled_at: { gte: from },
        status: {
          in: [
            AppointmentStatus.PENDIENTE,
            AppointmentStatus.CONFIRMADA,
            AppointmentStatus.REPROGRAMADA,
          ],
        },
      },
      orderBy: [{ scheduled_at: 'asc' }, { id: 'asc' }],
      take,
      select: {
        id: true,
        scheduled_at: true,
        durationMinutes: true,
        status: true,
        service: { select: { name: true } },
        patient: {
          select: { user: { select: { name: true, lastname: true } } },
        },
      },
    });
  }
}
