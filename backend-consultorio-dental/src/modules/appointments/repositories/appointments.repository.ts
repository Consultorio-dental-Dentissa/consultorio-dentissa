import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { AppointmentStatus, Prisma } from '@prisma/client';
import { GetAppointmentsDto } from '../dto/get-appointment.dto';
import { resolvePagination } from 'src/infrastructure/common/dto/pagination.dto';

export interface NewAppointmentData {
  scheduled_at: Date;
  notes: string;
  patient_id: number;
  service_id: number;
  durationMinutes: number;
}

export const BLOCKING_STATUSES: AppointmentStatus[] = [
  AppointmentStatus.PENDIENTE,
  AppointmentStatus.CONFIRMADA,
  // Estado legacy: ya no se asigna, pero las filas antiguas siguen bloqueando
  AppointmentStatus.REPROGRAMADA,
];

/** Ventana hacia atras para encontrar citas que empiezan antes y terminan dentro del intervalo. */
export const MAX_APPOINTMENT_SPAN_MS = 24 * 60 * 60_000;

@Injectable()
export class AppointmentsRepository {
  constructor(private prisma: PrismaService) {}

  async getAll(
    filters: GetAppointmentsDto,
    range?: { from?: Date; to?: Date },
    options?: { includeConsultation?: boolean },
  ) {
    const includeConsultation = options?.includeConsultation === true;
    const { skip, take } = resolvePagination(filters);
    const where: Prisma.AppointmentWhereInput = {
      patient_id: filters.patient_id,
      status: filters.completed_without_consultation
        ? AppointmentStatus.COMPLETADA
        : filters.status,
      // Una consulta por cita (appointment_id UNIQUE): sin consulta = relacion null
      consultation: filters.completed_without_consultation
        ? { is: null }
        : undefined,
      scheduled_at:
        range && (range.from || range.to)
          ? { gte: range.from, lte: range.to }
          : undefined,
      OR: filters.search
        ? [
            {
              patient: {
                user: {
                  name: { contains: filters.search, mode: 'insensitive' },
                },
              },
            },
            {
              patient: {
                user: {
                  lastname: { contains: filters.search, mode: 'insensitive' },
                },
              },
            },
            {
              service: {
                name: { contains: filters.search, mode: 'insensitive' },
              },
            },
          ]
        : undefined,
    };

    const [items, total] = await Promise.all([
      this.prisma.appointment.findMany({
        where,
        orderBy: [
          { scheduled_at: filters.sort ?? 'desc' },
          { id: filters.sort ?? 'desc' },
        ],
        skip,
        take,
        select: {
          id: true,
          scheduled_at: true,
          durationMinutes: true,
          status: true,
          created_at: true,
          notes: true,
          // Dato clinico: solo se consulta para ADMIN (una consulta por cita)
          ...(includeConsultation
            ? { consultation: { select: { id: true } } }
            : {}),
          service: {
            select: {
              name: true,
            },
          },
          patient: {
            select: {
              user: {
                select: {
                  name: true,
                  lastname: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.appointment.count({ where }),
    ]);

    return { items, total };
  }

  /** Detalle con campos explicitos: sin datos internos (cancelled_by_id, etc.). */
  async getById(
    id: number,
    options?: { includeConsultation?: boolean },
    transaction?: Prisma.TransactionClient,
  ) {
    const client = transaction ?? this.prisma;
    return await client.appointment.findFirst({
      where: { id },
      select: {
        ...(options?.includeConsultation
          ? { consultation: { select: { id: true } } }
          : {}),
        id: true,
        scheduled_at: true,
        durationMinutes: true,
        status: true,
        notes: true,
        reason: true,
        created_at: true,
        updated_at: true,
        patient_id: true,
        service_id: true,
        cancel_reason: true,
        cancelled_at: true,
        service: {
          select: { id: true, name: true, durationMinutes: true, price: true },
        },
        patient: {
          select: {
            id: true,
            user: { select: { name: true, lastname: true } },
          },
        },
      },
    });
  }

  async create(
    data: NewAppointmentData,
    transaction?: Prisma.TransactionClient,
  ) {
    const client = transaction ?? this.prisma;

    return await client.appointment.create({
      data: {
        scheduled_at: data.scheduled_at,
        notes: data.notes,
        patient_id: data.patient_id,
        service_id: data.service_id,
        durationMinutes: data.durationMinutes,
      },
      select: {
        id: true,
        scheduled_at: true,
        status: true,
        durationMinutes: true,
        created_at: true,
        notes: true,
        service: {
          select: {
            name: true,
          },
        },
        patient: {
          select: {
            user: {
              select: {
                id: true,
                name: true,
                lastname: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Citas bloqueantes candidatas a solapar con [start, end): las que empiezan
   * antes de `end` y no antes de `start - 24h`. Es una busqueda por intervalo
   * (no por dia local), asi que cubre citas que cruzan la medianoche. El
   * solape exacto lo filtra el service con la duracion guardada en la cita.
   */
  async getAppointmentsByDate(
    start: Date,
    end: Date,
    excludeAppointmentId?: number,
    transaction?: Prisma.TransactionClient,
  ) {
    const client = transaction ?? this.prisma;

    return await client.appointment.findMany({
      where: {
        scheduled_at: {
          gte: new Date(start.getTime() - MAX_APPOINTMENT_SPAN_MS),
          lt: end,
        },
        // PENDIENTE y CONFIRMADA bloquean el horario (spec 03); REPROGRAMADA es legacy
        status: { in: BLOCKING_STATUSES },
        id: excludeAppointmentId ? { not: excludeAppointmentId } : undefined,
      },
      select: {
        scheduled_at: true,
        durationMinutes: true,
      },
    });
  }

  /** Cita con el user_id del paciente (para notificar y validar propiedad). */
  async getByIdWithOwner(id: number, transaction?: Prisma.TransactionClient) {
    const client = transaction ?? this.prisma;

    return await client.appointment.findUnique({
      where: { id },
      select: {
        id: true,
        scheduled_at: true,
        durationMinutes: true,
        status: true,
        notes: true,
        service_id: true,
        patient_id: true,
        patient: {
          select: {
            user_id: true,
            user: { select: { name: true, lastname: true } },
          },
        },
      },
    });
  }

  /**
   * Cambia la cita solo si su estado sigue siendo el esperado (comprobacion
   * atomica contra carreras). Devuelve true si se actualizo una fila.
   */
  async updateIfStatus(
    id: number,
    expectedStatus: AppointmentStatus,
    data: Prisma.AppointmentUncheckedUpdateManyInput,
    transaction?: Prisma.TransactionClient,
  ) {
    const client = transaction ?? this.prisma;
    const result = await client.appointment.updateMany({
      where: { id, status: expectedStatus },
      data,
    });

    return result.count === 1;
  }

  async createReschedule(
    data: {
      appointment_id: number;
      previous_scheduled_at: Date;
      new_scheduled_at: Date;
      changed_by_id: number;
      reason?: string;
    },
    transaction?: Prisma.TransactionClient,
  ) {
    const client = transaction ?? this.prisma;

    return await client.appointmentReschedule.create({ data });
  }

  async getActiveAdminIds(transaction?: Prisma.TransactionClient) {
    const client = transaction ?? this.prisma;
    const admins = await client.user.findMany({
      where: { status: true, role: { role: 'ADMINISTRADOR' } },
      select: { id: true },
    });

    return admins.map((admin) => admin.id);
  }

  async createNotifications(
    notifications: {
      type: string;
      message: string;
      user_id: number;
      appointment_id: number;
    }[],
    transaction?: Prisma.TransactionClient,
  ) {
    if (notifications.length === 0) return;
    const client = transaction ?? this.prisma;

    await client.notification.createMany({ data: notifications });
  }
}
