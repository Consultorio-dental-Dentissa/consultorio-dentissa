import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { AppointmentsRepository } from './repositories/appointments.repository';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { ServicesRepository } from '../services/repositories/services.repository';
import { PatientsRepository } from '../patients/repositories/patients.repository';
import { GetAppointmentsDto } from './dto/get-appointment.dto';
import { Role } from '../users/enums/rol.enum';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { AppointmentStatus, Prisma } from '@prisma/client';
import { CancelAppointmentDto } from './dto/cancel-appointment.dto';
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import {
  formatDateTime,
  formatTime,
} from 'src/infrastructure/common/utils/timezone';
import { parseDateInput } from 'src/infrastructure/common/utils/date-input';
import { resolvePagination } from 'src/infrastructure/common/dto/pagination.dto';
import { AuditService } from '../audit/audit.service';
import { AuditAction, AuditEntity } from '../audit/audit.constants';

type AuthUser = { id: number; role: string };

const MAX_SERIALIZATION_RETRIES = 3;

/** REPROGRAMADA es un estado legacy: ya no se asigna y se trata como PENDIENTE. */
const PENDING_LIKE_STATUSES: AppointmentStatus[] = [
  AppointmentStatus.PENDIENTE,
  AppointmentStatus.REPROGRAMADA,
];

@Injectable()
export class AppointmentsService {
  constructor(
    private appointmentRepository: AppointmentsRepository,
    private servicesRepository: ServicesRepository,
    private patientsRepository: PatientsRepository,
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  /**
   * Para PACIENTE devuelve su patient_id (obtenido del usuario autenticado);
   * para el resto devuelve null.
   */
  private async resolveOwnPatientId(
    user: AuthUser,
    tx?: Prisma.TransactionClient,
  ): Promise<number | null> {
    if ((user.role as Role) !== Role.PACIENTE) {
      return null;
    }

    const patientId = await this.patientsRepository.getIdByUserId(user.id, tx);

    if (!patientId) {
      throw new ForbiddenException('No tienes un perfil de paciente asociado');
    }

    return patientId;
  }

  /** Sin usuario autenticado no se hace nada (nunca fail-open). */
  private assertAuthenticated(
    user: AuthUser | undefined,
  ): asserts user is AuthUser {
    if (!user || typeof user.id !== 'number' || !user.role) {
      throw new UnauthorizedException('No autenticado');
    }
  }

  async getAllAppointments(parameters: GetAppointmentsDto, user: AuthUser) {
    this.assertAuthenticated(user);
    const isAdmin = (user.role as Role) === Role.ADMINISTRADOR;
    if (parameters.completed_without_consultation && !isAdmin) {
      throw new ForbiddenException(
        'No tienes permiso para realizar esta acción',
      );
    }
    if (
      parameters.completed_without_consultation &&
      parameters.status &&
      parameters.status !== AppointmentStatus.COMPLETADA
    ) {
      throw new BadRequestException(
        'completed_without_consultation solo aplica a citas COMPLETADA',
      );
    }
    const ownPatientId = await this.resolveOwnPatientId(user);
    const filters =
      ownPatientId !== null
        ? { ...parameters, patient_id: ownPatientId }
        : parameters;

    const { page, limit } = resolvePagination(filters);
    const from = filters.from
      ? parseDateInput(filters.from, 'start')
      : undefined;
    const to = filters.to ? parseDateInput(filters.to, 'end') : undefined;
    if (from === null || to === null) {
      throw new BadRequestException('El rango de fechas no es válido');
    }
    if (from && to && from.getTime() > to.getTime()) {
      throw new BadRequestException(
        'La fecha inicial no puede ser posterior a la final',
      );
    }

    const { items: appointments, total } =
      await this.appointmentRepository.getAll(
        filters,
        { from, to },
        { includeConsultation: isAdmin },
      );

    // TODO: Cambiar despues al patron DTO
    const items = appointments.map((appointment) => {
      return {
        id: appointment.id,
        scheduled_at: appointment.scheduled_at,
        durationMinutes: appointment.durationMinutes,
        status: appointment.status,
        created_at: appointment.created_at,
        notes: appointment.notes,
        // Dato clinico: solo ADMIN; para el resto siempre null
        consultation_id: isAdmin
          ? ((appointment as { consultation?: { id: number } | null })
              .consultation?.id ?? null)
          : null,
        patient: {
          name: appointment.patient.user.name,
          lastname: appointment.patient.user.lastname,
        },
        service: {
          name: appointment.service.name,
        },
      };
    });

    return { items, total, page, limit };
  }

  async getAppointmentById(id: number, user: AuthUser) {
    this.assertAuthenticated(user);
    const ownPatientId = await this.resolveOwnPatientId(user);
    const isAdmin = (user.role as Role) === Role.ADMINISTRADOR;
    const appointment = await this.appointmentRepository.getById(id, {
      includeConsultation: isAdmin,
    });

    // Se responde 404 tambien si la cita es ajena, para no revelar su existencia
    if (
      !appointment ||
      (ownPatientId !== null && appointment.patient_id !== ownPatientId)
    ) {
      throw new NotFoundException('La cita no existe');
    }

    const { consultation, ...rest } = appointment as typeof appointment & {
      consultation?: { id: number } | null;
    };

    // Dato clinico: solo ADMIN; para el resto siempre null
    return {
      ...rest,
      consultation_id: isAdmin ? (consultation?.id ?? null) : null,
    };
  }

  async createAppoinment(
    createAppointmentDto: CreateAppointmentDto,
    user: AuthUser,
  ) {
    this.assertAuthenticated(user);

    const scheduledAt = new Date(createAppointmentDto.scheduled_at);
    if (
      Number.isNaN(scheduledAt.getTime()) ||
      scheduledAt.getTime() <= Date.now()
    ) {
      throw new BadRequestException(
        'La fecha de la cita no puede ser anterior a la fecha y hora actual',
      );
    }

    const appointment = await this.runSerializable(async (tx) => {
      const ownPatientId = await this.resolveOwnPatientId(user, tx);
      const patientId = ownPatientId ?? createAppointmentDto.patient_id;

      if (!patientId) {
        throw new BadRequestException('El paciente es requerido');
      }

      const patientUserStatus =
        await this.patientsRepository.getUserStatusByPatientId(patientId, tx);
      const service = await this.servicesRepository.getById(
        createAppointmentDto.service_id,
        tx,
      );

      if (patientUserStatus === null) {
        throw new NotFoundException('Paciente no encontrado');
      }
      if (!patientUserStatus) {
        throw new BadRequestException(
          'El paciente tiene su cuenta desactivada y no puede agendar citas',
        );
      }
      if (!service) throw new NotFoundException('Servicio no encontrado');
      if (!service.status) {
        throw new BadRequestException(
          'El servicio seleccionado no esta activo',
        );
      }

      /**
       * TODO: Recordar cambiar la logica cuando se
       * implementen multiples servicios en una sola cita
       */
      const newAppointment = {
        scheduled_at: new Date(scheduledAt),
        notes: createAppointmentDto.notes,
        patient_id: patientId,
        service_id: createAppointmentDto.service_id,
        durationMinutes: service.durationMinutes,
      };

      const newEnd = new Date(
        scheduledAt.getTime() + service.durationMinutes * 60_000,
      );
      const candidates = await this.appointmentRepository.getAppointmentsByDate(
        scheduledAt,
        newEnd,
        undefined,
        tx,
      );
      const conflict = this.existsScheduleConflict(newAppointment, candidates);

      if (conflict) {
        throw new ConflictException(
          `El horario choca con una cita agendada de ${formatTime(conflict.startDate)} a ${formatTime(conflict.endDate)}. Por favor escoja otro horario disponible`,
        );
      }

      const created = await this.appointmentRepository.create(
        newAppointment,
        tx,
      );

      // Si agenda el propio paciente, se avisa a los administradores (el personal no se notifica a sí mismo)
      if ((user.role as Role) === Role.PACIENTE) {
        const adminIds = await this.appointmentRepository.getActiveAdminIds(tx);
        await this.appointmentRepository.createNotifications(
          adminIds.map((user_id) => ({
            type: 'CITA_CREADA',
            message: `${this.patientLabel(created)} agendó una cita de ${service.name} para el ${formatDateTime(created.scheduled_at)}`,
            user_id,
            appointment_id: created.id,
          })),
          tx,
        );
      }

      await this.auditService.log(
        {
          userId: user.id,
          action: AuditAction.APPOINTMENT_CREATED,
          entity: AuditEntity.APPOINTMENT,
          entityId: created.id,
          after: {
            status: created.status,
            patient_id: patientId,
            service_id: newAppointment.service_id,
            scheduled_at: newAppointment.scheduled_at,
            durationMinutes: newAppointment.durationMinutes,
          },
        },
        tx,
      );

      return created;
    });

    if (!appointment) {
      throw new UnprocessableEntityException(
        'Algo ha salido mal. Intentalo mas tarde',
      );
    }

    return {
      id: appointment.id,
      scheduled_at: appointment.scheduled_at,
      durationMinutes: appointment.durationMinutes,
      status: appointment.status,
      notes: appointment.notes,
      created_at: appointment.created_at,
      patient: {
        name: appointment.patient.user.name,
        lastname: appointment.patient.user.lastname,
      },
      service: {
        name: appointment.service.name,
      },
    };
  }

  /**
   * Carga la cita aplicando propiedad: un PACIENTE solo accede a las suyas
   * (una ajena responde 404 para no revelar su existencia).
   */
  private async loadForChange(
    id: number,
    user: AuthUser,
    tx: Prisma.TransactionClient,
  ) {
    this.assertAuthenticated(user);
    const ownPatientId = await this.resolveOwnPatientId(user, tx);
    const appointment = await this.appointmentRepository.getByIdWithOwner(
      id,
      tx,
    );

    if (
      !appointment ||
      (ownPatientId !== null && appointment.patient_id !== ownPatientId)
    ) {
      throw new NotFoundException('La cita no existe');
    }

    return appointment;
  }

  /** Reglas comunes de cancelar/reprogramar segun rol y estado. */
  private assertCanCancelOrReschedule(
    appointment: { status: AppointmentStatus; scheduled_at: Date },
    user: AuthUser,
    action: 'cancelar' | 'reprogramar' | 'editar',
  ) {
    const status = appointment.status;
    if (status === AppointmentStatus.COMPLETADA) {
      throw new ConflictException(`No se puede ${action} una cita completada`);
    }
    if (status === AppointmentStatus.CANCELADA) {
      throw new ConflictException(`No se puede ${action} una cita cancelada`);
    }

    // REPROGRAMADA es legacy y se trata como PENDIENTE
    if (
      (user.role as Role) === Role.PACIENTE &&
      !PENDING_LIKE_STATUSES.includes(status)
    ) {
      throw new ForbiddenException(
        `Solo puedes ${action} citas que aún están pendientes. Comunícate con el consultorio`,
      );
    }

    // El paciente no puede modificar una cita cuya fecha ya paso (o es ahora)
    if (
      (user.role as Role) === Role.PACIENTE &&
      new Date(appointment.scheduled_at).getTime() <= Date.now()
    ) {
      throw new ConflictException(
        `No puedes ${action} una cita cuya fecha y hora ya pasó. Comunícate con el consultorio`,
      );
    }
  }

  private assertAdmin(user: AuthUser) {
    if ((user.role as Role) !== Role.ADMINISTRADOR) {
      throw new ForbiddenException(
        'No tienes permiso para realizar esta acción',
      );
    }
  }

  /** Nombre del paciente para los avisos al personal; sin datos, "Un paciente". */
  private patientLabel(appointment: {
    patient: { user?: { name: string; lastname: string } | null };
  }): string {
    const user = appointment.patient.user;
    return user ? `${user.name} ${user.lastname}`.trim() : 'Un paciente';
  }

  /**
   * Si actua el paciente se avisa a los administradores; si actua el
   * personal, se avisa al paciente. Se ejecuta dentro de la transaccion.
   */
  private async notifyAppointmentChange(
    tx: Prisma.TransactionClient,
    appointment: { id: number; patient: { user_id: number } },
    actor: AuthUser,
    type: string,
    patientMessage: string,
    adminMessage: string,
  ) {
    if ((actor.role as Role) === Role.PACIENTE) {
      const adminIds = await this.appointmentRepository.getActiveAdminIds(tx);
      await this.appointmentRepository.createNotifications(
        adminIds.map((user_id) => ({
          type,
          message: adminMessage,
          user_id,
          appointment_id: appointment.id,
        })),
        tx,
      );
      return;
    }

    await this.appointmentRepository.createNotifications(
      [
        {
          type,
          message: patientMessage,
          user_id: appointment.patient.user_id,
          appointment_id: appointment.id,
        },
      ],
      tx,
    );
  }

  /** Transicion simple con comprobacion atomica del estado esperado. */
  private async transition(
    id: number,
    user: AuthUser,
    from: AppointmentStatus[],
    to: AppointmentStatus,
    invalidMessage: string,
    notification: { type: string; message: string },
    auditAction: string,
    assertTiming?: (scheduledAt: Date) => void,
  ) {
    return await this.prisma.$transaction(async (tx) => {
      const appointment = await this.loadForChange(id, user, tx);

      if (!from.includes(appointment.status)) {
        throw new ConflictException(invalidMessage);
      }

      assertTiming?.(new Date(appointment.scheduled_at));

      const updated = await this.appointmentRepository.updateIfStatus(
        id,
        appointment.status,
        { status: to },
        tx,
      );

      // Otro proceso cambio el estado entre la lectura y la escritura
      if (!updated) throw new ConflictException(invalidMessage);

      await this.notifyAppointmentChange(
        tx,
        appointment,
        user,
        notification.type,
        notification.message,
        notification.message,
      );

      await this.auditService.log(
        {
          userId: user.id,
          action: auditAction,
          entity: AuditEntity.APPOINTMENT,
          entityId: id,
          before: { status: appointment.status },
          after: { status: to },
        },
        tx,
      );

      return { id, status: to };
    });
  }

  /** Solo ADMINISTRADOR; desde PENDIENTE (o REPROGRAMADA, legacy). */
  async confirmAppointment(id: number, user: AuthUser) {
    this.assertAuthenticated(user);
    this.assertAdmin(user);

    return await this.transition(
      id,
      user,
      PENDING_LIKE_STATUSES,
      AppointmentStatus.CONFIRMADA,
      'Solo se puede confirmar una cita pendiente',
      {
        type: 'CITA_CONFIRMADA',
        message: 'Tu cita ha sido confirmada por el consultorio',
      },
      AuditAction.APPOINTMENT_CONFIRMED,
      (scheduledAt) => {
        if (scheduledAt.getTime() <= Date.now()) {
          throw new ConflictException(
            'No se puede confirmar una cita cuya fecha y hora ya pasó',
          );
        }
      },
    );
  }

  /**
   * Solo ADMINISTRADOR; solo desde CONFIRMADA y una vez iniciada la cita.
   */
  async completeAppointment(id: number, user: AuthUser) {
    this.assertAuthenticated(user);
    this.assertAdmin(user);

    return await this.transition(
      id,
      user,
      [AppointmentStatus.CONFIRMADA],
      AppointmentStatus.COMPLETADA,
      'Solo se puede completar una cita confirmada',
      {
        type: 'CITA_COMPLETADA',
        message: 'Tu cita ha sido marcada como completada',
      },
      AuditAction.APPOINTMENT_COMPLETED,
      (scheduledAt) => {
        if (scheduledAt.getTime() > Date.now()) {
          throw new ConflictException(
            'No se puede completar una cita que aún no ha iniciado',
          );
        }
      },
    );
  }

  async cancelAppointment(
    id: number,
    dto: CancelAppointmentDto,
    user: AuthUser,
  ) {
    this.assertAuthenticated(user);
    const reason = dto.reason?.trim();
    if (!reason) {
      throw new BadRequestException('El motivo de la cancelación es requerido');
    }

    return await this.prisma.$transaction(async (tx) => {
      const appointment = await this.loadForChange(id, user, tx);

      this.assertCanCancelOrReschedule(appointment, user, 'cancelar');

      const updated = await this.appointmentRepository.updateIfStatus(
        id,
        appointment.status,
        {
          status: AppointmentStatus.CANCELADA,
          cancel_reason: reason,
          cancelled_by_id: user.id,
          cancelled_at: new Date(),
        },
        tx,
      );

      if (!updated) {
        throw new ConflictException(
          'La cita cambió de estado mientras se procesaba. Actualiza e inténtalo de nuevo',
        );
      }

      const when = formatDateTime(appointment.scheduled_at);
      await this.notifyAppointmentChange(
        tx,
        appointment,
        user,
        'CITA_CANCELADA',
        `Tu cita del ${when} fue cancelada por el consultorio`,
        `${this.patientLabel(appointment)} canceló su cita del ${when}`,
      );

      // El motivo (texto libre) no se copia a la auditoria; queda en la cita
      await this.auditService.log(
        {
          userId: user.id,
          action: AuditAction.APPOINTMENT_CANCELLED,
          entity: AuditEntity.APPOINTMENT,
          entityId: id,
          before: { status: appointment.status },
          after: { status: AppointmentStatus.CANCELADA },
        },
        tx,
      );

      return {
        id,
        status: AppointmentStatus.CANCELADA,
        cancel_reason: reason,
      };
    });
  }

  /**
   * Reprogramar es una OPERACION con historial (no un estado): la cita
   * conserva su estado (PENDIENTE/CONFIRMADA, segun la spec 03) y el cambio
   * queda en AppointmentReschedule. Libera el horario anterior y reserva el
   * nuevo de forma atomica en una transaccion Serializable.
   * El estado REPROGRAMADA del enum ya no se asigna.
   */
  async rescheduleAppointment(
    id: number,
    dto: RescheduleAppointmentDto,
    user: AuthUser,
  ) {
    this.assertAuthenticated(user);
    const newStart = new Date(dto.scheduled_at);
    const reason = dto.reason?.trim();

    if (!reason) {
      throw new BadRequestException(
        'El motivo de la reprogramación es requerido',
      );
    }

    if (Number.isNaN(newStart.getTime()) || newStart.getTime() <= Date.now()) {
      throw new BadRequestException(
        'La nueva fecha de la cita no puede ser anterior a la fecha y hora actual',
      );
    }

    return await this.runSerializable(async (tx) => {
      const appointment = await this.loadForChange(id, user, tx);

      this.assertCanCancelOrReschedule(appointment, user, 'reprogramar');

      const previousStart = new Date(appointment.scheduled_at);
      if (previousStart.getTime() === newStart.getTime()) {
        throw new BadRequestException(
          'La nueva fecha debe ser distinta a la actual',
        );
      }

      const service = await this.servicesRepository.getById(
        appointment.service_id,
        tx,
      );
      if (!service || !service.status) {
        throw new BadRequestException(
          'El servicio de la cita ya no está activo',
        );
      }

      const newEnd = new Date(
        newStart.getTime() + appointment.durationMinutes * 60_000,
      );
      const candidates = await this.appointmentRepository.getAppointmentsByDate(
        newStart,
        newEnd,
        id,
        tx,
      );
      const conflict = this.existsScheduleConflict(
        {
          scheduled_at: newStart,
          durationMinutes: appointment.durationMinutes,
        },
        candidates,
      );

      if (conflict) {
        throw new ConflictException(
          `El horario choca con una cita agendada de ${formatTime(conflict.startDate)} a ${formatTime(conflict.endDate)}. Por favor escoja otro horario disponible`,
        );
      }

      const updated = await this.appointmentRepository.updateIfStatus(
        id,
        appointment.status,
        { scheduled_at: newStart },
        tx,
      );

      if (!updated) {
        throw new ConflictException(
          'La cita cambió de estado mientras se procesaba. Actualiza e inténtalo de nuevo',
        );
      }

      await this.appointmentRepository.createReschedule(
        {
          appointment_id: id,
          previous_scheduled_at: previousStart,
          new_scheduled_at: newStart,
          changed_by_id: user.id,
          reason,
        },
        tx,
      );

      await this.notifyAppointmentChange(
        tx,
        appointment,
        user,
        'CITA_REPROGRAMADA',
        `Tu cita fue reprogramada del ${formatDateTime(previousStart)} al ${formatDateTime(newStart)}`,
        `${this.patientLabel(appointment)} reprogramó su cita del ${formatDateTime(previousStart)} al ${formatDateTime(newStart)}`,
      );

      await this.auditService.log(
        {
          userId: user.id,
          action: AuditAction.APPOINTMENT_RESCHEDULED,
          entity: AuditEntity.APPOINTMENT,
          entityId: id,
          before: { scheduled_at: previousStart },
          after: { scheduled_at: newStart },
        },
        tx,
      );

      return {
        id,
        status: appointment.status,
        scheduled_at: newStart,
        previous_scheduled_at: previousStart,
      };
    });
  }

  /**
   * Edita servicio y/o notas de la cita (NO la fecha: eso es reschedule).
   * Staff: PENDIENTE/CONFIRMADA/REPROGRAMADA. PACIENTE: solo las suyas,
   * PENDIENTE/REPROGRAMADA y futuras. COMPLETADA/CANCELADA: 409 para todos.
   * Si cambia el servicio la cita toma su duracion y se revalida el solape
   * (excluyendo la propia cita) en transaccion Serializable.
   */
  async updateAppointment(
    id: number,
    dto: UpdateAppointmentDto,
    user: AuthUser,
  ) {
    this.assertAuthenticated(user);

    if (dto.service_id === undefined && dto.notes === undefined) {
      throw new BadRequestException('Envía al menos un campo para actualizar');
    }

    return await this.runSerializable(async (tx) => {
      const appointment = await this.loadForChange(id, user, tx);

      this.assertCanCancelOrReschedule(appointment, user, 'editar');

      const changedFields: string[] = [];
      const data: Prisma.AppointmentUncheckedUpdateManyInput = {};

      if (dto.notes !== undefined && dto.notes !== appointment.notes) {
        data.notes = dto.notes;
        changedFields.push('notes');
      }

      if (
        dto.service_id !== undefined &&
        dto.service_id !== appointment.service_id
      ) {
        const service = await this.servicesRepository.getById(
          dto.service_id,
          tx,
        );
        if (!service) throw new NotFoundException('Servicio no encontrado');
        if (!service.status) {
          throw new BadRequestException(
            'El servicio seleccionado no esta activo',
          );
        }

        const start = new Date(appointment.scheduled_at);
        const newEnd = new Date(
          start.getTime() + service.durationMinutes * 60_000,
        );
        const candidates =
          await this.appointmentRepository.getAppointmentsByDate(
            start,
            newEnd,
            id,
            tx,
          );
        const conflict = this.existsScheduleConflict(
          { scheduled_at: start, durationMinutes: service.durationMinutes },
          candidates,
        );
        if (conflict) {
          throw new ConflictException(
            `El horario choca con una cita agendada de ${formatTime(conflict.startDate)} a ${formatTime(conflict.endDate)}. Por favor escoja otro horario disponible`,
          );
        }

        data.service_id = service.id;
        data.durationMinutes = service.durationMinutes;
        changedFields.push('service_id');
      }

      const isAdmin = (user.role as Role) === Role.ADMINISTRADOR;

      // Sin cambios reales: sin escritura, notificacion ni auditoria
      if (changedFields.length > 0) {
        const updated = await this.appointmentRepository.updateIfStatus(
          id,
          appointment.status,
          data,
          tx,
        );

        if (!updated) {
          throw new ConflictException(
            'La cita cambió de estado mientras se procesaba. Actualiza e inténtalo de nuevo',
          );
        }

        // Aviso generico: sin el texto de las notas
        const when = formatDateTime(appointment.scheduled_at);
        await this.notifyAppointmentChange(
          tx,
          appointment,
          user,
          'CITA_ACTUALIZADA',
          `Tu cita del ${when} fue actualizada por el consultorio`,
          `${this.patientLabel(appointment)} actualizó su cita del ${when}`,
        );

        // Solo los NOMBRES de los campos: nunca el contenido de las notas
        await this.auditService.log(
          {
            userId: user.id,
            action: AuditAction.APPOINTMENT_UPDATED,
            entity: AuditEntity.APPOINTMENT,
            entityId: id,
            after: { changedFields },
          },
          tx,
        );
      }

      const detail = await this.appointmentRepository.getById(
        id,
        { includeConsultation: isAdmin },
        tx,
      );
      if (!detail) throw new NotFoundException('La cita no existe');

      const { consultation, ...rest } = detail as typeof detail & {
        consultation?: { id: number } | null;
      };
      return {
        ...rest,
        consultation_id: isAdmin ? (consultation?.id ?? null) : null,
      };
    });
  }
  /**
   * Violacion de la restriccion EXCLUDE de la BD (ultima linea de defensa).
   * Se reconoce por el nombre de la restriccion o por SQLSTATE 23P01 en
   * message/code/meta/cause (y objetos anidados, p. ej. errores del adapter).
   */
  private isOverlapConstraintError(
    error: unknown,
    depth = 0,
    seen = new WeakSet<object>(),
  ): boolean {
    if (error === null || error === undefined || depth > 6) return false;

    if (typeof error === 'string') {
      return (
        error.includes('appointments_no_overlap') || /\b23P01\b/.test(error)
      );
    }
    if (typeof error !== 'object') return false;
    if (seen.has(error)) return false;
    seen.add(error);

    // getOwnPropertyNames incluye propiedades no enumerables (message, cause)
    const record = error as Record<string, unknown>;
    return Object.getOwnPropertyNames(error).some(
      (key) =>
        key !== 'stack' &&
        this.isOverlapConstraintError(record[key], depth + 1, seen),
    );
  }

  /**
   * Ejecuta la operacion en una transaccion Serializable y reintenta si
   * Postgres aborta por conflicto de serializacion (P2034).
   */
  private async runSerializable<T>(
    work: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    for (let attempt = 1; ; attempt++) {
      try {
        return await this.prisma.$transaction(work, {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        });
      } catch (error) {
        if (this.isOverlapConstraintError(error)) {
          throw new ConflictException(
            'El horario choca con otra cita agendada. Por favor escoja otro horario disponible',
          );
        }

        const isSerializationError =
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2034';

        if (!isSerializationError) throw error;

        if (attempt >= MAX_SERIALIZATION_RETRIES) {
          throw new ConflictException(
            'No se pudo completar la operación por alta concurrencia. Inténtalo de nuevo',
          );
        }
      }
    }
  }

  /**
   * Verifica si el horario de una cita nueva se traslapa con alguna ya
   * establecida. El solape es estricto: dos citas consecutivas (una termina
   * justo cuando empieza la otra) no chocan. No muta las fechas recibidas.
   */
  private existsScheduleConflict(
    pendingAppointment: { scheduled_at: Date; durationMinutes: number },
    appointments: { scheduled_at: Date; durationMinutes: number }[],
  ) {
    const newStart = new Date(pendingAppointment.scheduled_at).getTime();
    const newEnd = newStart + pendingAppointment.durationMinutes * 60_000;

    for (const appointment of appointments) {
      const existingStart = new Date(appointment.scheduled_at).getTime();
      const existingEnd = existingStart + appointment.durationMinutes * 60_000;

      if (newStart < existingEnd && newEnd > existingStart) {
        return {
          startDate: new Date(existingStart),
          endDate: new Date(existingEnd),
        };
      }
    }
  }
}
