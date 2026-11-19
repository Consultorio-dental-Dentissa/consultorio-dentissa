import { Injectable } from '@nestjs/common';
import { AppointmentStatus } from '@prisma/client';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import {
  APP_TIMEZONE,
  getDayBounds,
} from 'src/infrastructure/common/utils/timezone';
import { DashboardRepository } from './repositories/dashboard.repository';

const UPCOMING_LIMIT = 10;

function toStatusMap(groups: { status: AppointmentStatus; count: number }[]) {
  const map = Object.fromEntries(
    Object.values(AppointmentStatus).map((s) => [s, 0]),
  ) as Record<AppointmentStatus, number>;

  for (const g of groups) map[g.status] = g.count;

  return map;
}

@Injectable()
export class DashboardService {
  constructor(
    private dashboardRepository: DashboardRepository,
    private prisma: PrismaService,
  ) {}

  /** Pacientes registrados y servicios (tratamientos) activos para el sitio público. */
  async getPublicStats() {
    const [patients, services] = await Promise.all([
      this.dashboardRepository.countPatients(),
      this.dashboardRepository.countServices(),
    ]);

    return { patients: patients.total, treatments: services.active };
  }

  async getStats() {
    const now = new Date();
    const today = getDayBounds(now);

    // Una sola foto consistente de la BD para todas las lecturas.
    const [todayGroups, allGroups, patients, services, upcoming] =
      await this.prisma.$transaction(
        async (tx) => [
          await this.dashboardRepository.countAppointmentsByStatus(today, tx),
          await this.dashboardRepository.countAppointmentsByStatus(
            undefined,
            tx,
          ),
          await this.dashboardRepository.countPatients(tx),
          await this.dashboardRepository.countServices(tx),
          await this.dashboardRepository.getUpcomingAppointments(
            now,
            UPCOMING_LIMIT,
            tx,
          ),
        ],
        { isolationLevel: 'RepeatableRead' },
      );

    const todayByStatus = toStatusMap(todayGroups);

    return {
      timezone: APP_TIMEZONE,
      generatedAt: now,
      appointments: {
        today: {
          from: today.start,
          to: today.end,
          total: todayGroups.reduce((sum, g) => sum + g.count, 0),
          byStatus: todayByStatus,
        },
        byStatus: toStatusMap(allGroups),
        total: allGroups.reduce((sum, g) => sum + g.count, 0),
        upcoming: upcoming.map((a) => ({
          id: a.id,
          scheduled_at: a.scheduled_at,
          durationMinutes: a.durationMinutes,
          status: a.status,
          patient: {
            name: a.patient.user.name,
            lastname: a.patient.user.lastname,
          },
          service: { name: a.service.name },
        })),
      },
      patients,
      services,
    };
  }
}
