import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { resolvePagination } from 'src/infrastructure/common/dto/pagination.dto';

export interface ConsultationFilters {
  page?: number;
  limit?: number;
  search?: string;
  patient_id?: number;
  from?: Date;
  to?: Date;
}

export const CONSULTATION_SELECT = {
  id: true,
  appointment_id: true,
  notes: true,
  observations: true,
  created_at: true,
  updated_at: true,
  created_by_id: true,
  updated_by_id: true,
  appointment: {
    select: {
      id: true,
      scheduled_at: true,
      status: true,
      service: { select: { id: true, name: true } },
      patient: {
        select: {
          id: true,
          user: { select: { name: true, lastname: true } },
        },
      },
    },
  },
  images: { select: { id: true, url: true }, orderBy: { id: 'asc' } },
} satisfies Prisma.ConsultationSelect;

export type ConsultationRow = Prisma.ConsultationGetPayload<{
  select: typeof CONSULTATION_SELECT;
}>;

@Injectable()
export class ConsultationsRepository {
  constructor(private prisma: PrismaService) {}

  private buildWhere(
    filters: ConsultationFilters,
  ): Prisma.ConsultationWhereInput {
    const search = filters.search?.trim();

    return {
      appointment: {
        patient_id: filters.patient_id,
        scheduled_at:
          filters.from || filters.to
            ? { gte: filters.from, lte: filters.to }
            : undefined,
        patient: search
          ? {
              user: {
                OR: [
                  { name: { contains: search, mode: 'insensitive' } },
                  { lastname: { contains: search, mode: 'insensitive' } },
                ],
              },
            }
          : undefined,
      },
    };
  }

  async getAll(filters: ConsultationFilters) {
    const { skip, take } = resolvePagination(filters);
    const where = this.buildWhere(filters);

    const [items, total] = await Promise.all([
      this.prisma.consultation.findMany({
        where,
        orderBy: [{ appointment: { scheduled_at: 'desc' } }, { id: 'desc' }],
        skip,
        take,
        select: CONSULTATION_SELECT,
      }),
      this.prisma.consultation.count({ where }),
    ]);

    return { items, total };
  }

  async getById(id: number, tx?: Prisma.TransactionClient) {
    const client = tx ?? this.prisma;
    return await client.consultation.findUnique({
      where: { id },
      select: CONSULTATION_SELECT,
    });
  }

  /** Bloquea la consulta (SELECT ... FOR UPDATE) hasta el fin de la transaccion. */
  async lockById(id: number, tx: Prisma.TransactionClient) {
    await tx.$queryRaw`SELECT id FROM consultations WHERE id = ${id} FOR UPDATE`;
  }

  /** Cita con su estado y el user_id del paciente (para notificar). */
  async getAppointmentForConsultation(
    appointmentId: number,
    tx: Prisma.TransactionClient,
  ) {
    return await tx.appointment.findUnique({
      where: { id: appointmentId },
      select: {
        id: true,
        status: true,
        scheduled_at: true,
        patient: { select: { user_id: true } },
        consultation: { select: { id: true } },
      },
    });
  }

  async create(
    data: {
      appointment_id: number;
      notes: string;
      observations: string;
      created_by_id: number;
    },
    tx: Prisma.TransactionClient,
  ) {
    return await tx.consultation.create({
      data: { ...data, updated_by_id: data.created_by_id },
      select: CONSULTATION_SELECT,
    });
  }

  async update(
    id: number,
    data: { notes?: string; observations?: string; updated_by_id: number },
    tx: Prisma.TransactionClient,
  ) {
    return await tx.consultation.update({
      where: { id },
      data,
      select: CONSULTATION_SELECT,
    });
  }

  async countImages(consultationId: number, tx: Prisma.TransactionClient) {
    return await tx.consultationImage.count({
      where: { consultation_id: consultationId },
    });
  }

  async createImage(
    consultationId: number,
    storedName: string,
    tx: Prisma.TransactionClient,
  ) {
    return await tx.consultationImage.create({
      data: { consultation_id: consultationId, url: storedName },
      select: { id: true, url: true },
    });
  }

  /** La imagen solo se encuentra si pertenece a ESA consulta (ownership). */
  async findImage(
    consultationId: number,
    imageId: number,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;
    return await client.consultationImage.findFirst({
      where: { id: imageId, consultation_id: consultationId },
      select: { id: true, url: true },
    });
  }

  async deleteImage(imageId: number, tx: Prisma.TransactionClient) {
    await tx.consultationImage.delete({ where: { id: imageId } });
  }

  async createNotification(
    data: {
      type: string;
      message: string;
      user_id: number;
      appointment_id: number;
    },
    tx: Prisma.TransactionClient,
  ) {
    await tx.notification.create({ data, select: { id: true } });
  }
}
