import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { CreatePatientDto } from '../dto/create-patient.dto';
import { GetPatientsDto } from '../dto/get-patients.dto';
import { AppointmentStatus, Prisma } from '@prisma/client';
import { resolvePagination } from 'src/infrastructure/common/dto/pagination.dto';
import { parseDateInput } from 'src/infrastructure/common/utils/date-input';

/** Datos minimos que ve el ASISTENTE: sin direccion, nacimiento ni contacto de emergencia. */
const REDUCED_SELECT = {
  id: true,
  user_id: true,
  user: {
    select: {
      name: true,
      lastname: true,
      email: true,
      phone: true,
      status: true,
    },
  },
} satisfies Prisma.PatientSelect;

const FULL_SELECT = {
  id: true,
  user_id: true,
  address: true,
  birth_date: true,
  emergency_phone: true,
  user: {
    select: {
      name: true,
      lastname: true,
      email: true,
      phone: true,
      status: true,
    },
  },
} satisfies Prisma.PatientSelect;

export type PatientDetailLevel = 'full' | 'reduced';

@Injectable()
export class PatientsRepository {
  constructor(private prisma: PrismaService) {}

  async getAll(filters?: GetPatientsDto, detail: PatientDetailLevel = 'full') {
    const { skip, take } = resolvePagination(filters);
    const where: Prisma.PatientWhereInput = {
      user:
        filters?.status !== undefined ? { status: filters.status } : undefined,
      OR: filters?.search
        ? [
            {
              user: {
                name: { contains: filters.search, mode: 'insensitive' },
              },
            },
            {
              user: {
                lastname: { contains: filters.search, mode: 'insensitive' },
              },
            },
            {
              user: {
                email: { contains: filters.search, mode: 'insensitive' },
              },
            },
            {
              user: {
                phone: { contains: filters.search, mode: 'insensitive' },
              },
            },
            {
              emergency_phone: {
                contains: filters.search,
                mode: 'insensitive',
              },
            },
          ]
        : undefined,
    };

    const [items, total] = await Promise.all([
      this.prisma.patient.findMany({
        where,
        orderBy: { id: 'asc' },
        skip,
        take,
        select: detail === 'reduced' ? REDUCED_SELECT : FULL_SELECT,
      }),
      this.prisma.patient.count({ where }),
    ]);

    // Una sola consulta agregada para toda la pagina (sin N+1)
    const nextByPatient = await this.getNextAppointmentDates(
      items.map((p) => p.id),
    );
    const itemsWithNext = items.map((p) => ({
      ...p,
      next_appointment_at: nextByPatient.get(p.id) ?? null,
    }));

    return { items: itemsWithNext, total };
  }

  /** Proxima cita futura PENDIENTE/CONFIRMADA/REPROGRAMADA por paciente. */
  async getNextAppointmentDates(patientIds: number[], now = new Date()) {
    const result = new Map<number, Date>();
    if (patientIds.length === 0) return result;

    const rows = await this.prisma.appointment.groupBy({
      by: ['patient_id'],
      where: {
        patient_id: { in: patientIds },
        status: {
          in: [
            AppointmentStatus.PENDIENTE,
            AppointmentStatus.CONFIRMADA,
            AppointmentStatus.REPROGRAMADA,
          ],
        },
        scheduled_at: { gt: now },
      },
      _min: { scheduled_at: true },
    });
    for (const r of rows) {
      if (r._min.scheduled_at) result.set(r.patient_id, r._min.scheduled_at);
    }
    return result;
  }

  async getById(
    id: number,
    transaction?: Prisma.TransactionClient,
    detail: PatientDetailLevel = 'full',
  ) {
    const client = transaction ?? this.prisma;
    return await client.patient.findUnique({
      where: { id },
      select: detail === 'reduced' ? REDUCED_SELECT : FULL_SELECT,
    });
  }

  async create(
    createPatientDto: CreatePatientDto,
    transaction?: Prisma.TransactionClient,
  ) {
    const client = transaction ?? this.prisma;
    // AAAA-MM-DD real o ISO con zona (el DTO ya lo valida; defensa en profundidad)
    const birthDate = parseDateInput(createPatientDto.birth_date, 'start');
    if (!birthDate) {
      throw new BadRequestException('La fecha de nacimiento no es válida');
    }

    return await client.patient.create({
      data: {
        address: createPatientDto.address,
        birth_date: birthDate,
        emergency_phone: createPatientDto.emergency_phone,
        user_id: createPatientDto.user_id!,
      },
    });
  }

  async getIdByUserId(
    userId: number,
    transaction?: Prisma.TransactionClient,
  ): Promise<number | null> {
    const client = transaction ?? this.prisma;
    const patient = await client.patient.findUnique({
      where: { user_id: userId },
      select: { id: true },
    });

    return patient?.id ?? null;
  }

  /** Estado del usuario del paciente; null si el paciente no existe. */
  async getUserStatusByPatientId(
    id: number,
    transaction?: Prisma.TransactionClient,
  ): Promise<boolean | null> {
    const client = transaction ?? this.prisma;
    const patient = await client.patient.findUnique({
      where: { id },
      select: { user: { select: { status: true } } },
    });

    return patient ? patient.user.status : null;
  }

  async existById(id: number) {
    return (await this.prisma.patient.count({
      where: {
        id: id,
      },
    })) > 0
      ? true
      : false;
  }

  /** Datos actuales (con ids) para calcular que campos cambian. */
  async getForUpdate(id: number, tx: Prisma.TransactionClient) {
    return await tx.patient.findUnique({
      where: { id },
      select: {
        id: true,
        address: true,
        birth_date: true,
        emergency_phone: true,
        user: {
          select: {
            id: true,
            name: true,
            lastname: true,
            email: true,
            phone: true,
            status: true,
          },
        },
      },
    });
  }

  async isEmailTakenByOther(
    email: string,
    userId: number,
    tx: Prisma.TransactionClient,
  ) {
    return (
      (await tx.user.count({
        where: {
          email: { equals: email, mode: 'insensitive' },
          id: { not: userId },
        },
      })) > 0
    );
  }

  async isPhoneTakenByOther(
    phone: string,
    userId: number,
    tx: Prisma.TransactionClient,
  ) {
    return (await tx.user.count({ where: { phone, id: { not: userId } } })) > 0;
  }

  /** Cierra todas las sesiones del usuario (cambio de correo). */
  async revokeRefreshTokens(userId: number, tx: Prisma.TransactionClient) {
    await tx.refreshToken.updateMany({
      where: { user_id: userId, revoked_at: null },
      data: { revoked_at: new Date() },
    });
  }

  /** Invalida los enlaces de recuperacion pendientes (apuntaban al correo anterior). */
  async invalidateResetTokens(userId: number, tx: Prisma.TransactionClient) {
    await tx.passwordResetToken.updateMany({
      where: { user_id: userId, used_at: null },
      data: { used_at: new Date() },
    });
  }

  /** Hash de la contrasena (omitido por defecto en PrismaService). Nunca se devuelve ni se registra. */
  async getPasswordHash(userId: number, tx: Prisma.TransactionClient) {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });
    return user?.password ?? null;
  }

  async applyUpdate(
    patientId: number,
    userId: number,
    userData: {
      name?: string;
      lastname?: string;
      email?: string;
      phone?: string;
      status?: boolean;
    },
    patientData: {
      address?: string;
      birth_date?: Date;
      emergency_phone?: string;
    },
    tx: Prisma.TransactionClient,
  ) {
    if (Object.keys(userData).length > 0) {
      await tx.user.update({
        where: { id: userId },
        data: userData,
        select: { id: true },
      });
    }
    if (Object.keys(patientData).length > 0) {
      await tx.patient.update({
        where: { id: patientId },
        data: patientData,
        select: { id: true },
      });
    }

    return await this.getById(patientId, tx);
  }

  /** Historial de citas del paciente (nunca incluye datos de otros pacientes). */
  async getAppointmentHistory(
    patientId: number,
    page: { skip: number; take: number },
    includeConsultationFlag: boolean,
  ) {
    const where: Prisma.AppointmentWhereInput = { patient_id: patientId };

    const [items, total] = await Promise.all([
      this.prisma.appointment.findMany({
        where,
        orderBy: [{ scheduled_at: 'desc' }, { id: 'desc' }],
        skip: page.skip,
        take: page.take,
        select: {
          id: true,
          scheduled_at: true,
          durationMinutes: true,
          status: true,
          notes: true,
          cancel_reason: true,
          created_at: true,
          service: { select: { id: true, name: true } },
          // Solo el ADMIN sabe si hay consulta (dato clinico)
          consultation: includeConsultationFlag
            ? { select: { id: true } }
            : false,
        },
      }),
      this.prisma.appointment.count({ where }),
    ]);

    return { items, total };
  }
}
