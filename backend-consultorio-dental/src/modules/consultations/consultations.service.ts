import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AppointmentStatus, Prisma } from '@prisma/client';
import type { Response } from 'express';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { TX_OPTIONS } from 'src/infrastructure/prisma/transaction-options';
import { resolvePagination } from 'src/infrastructure/common/dto/pagination.dto';
import { parseDateInput } from 'src/infrastructure/common/utils/date-input';
import { formatDateTime } from 'src/infrastructure/common/utils/timezone';
import { FileStorageService } from 'src/infrastructure/storage/file-storage.service';
import {
  MAX_IMAGES_PER_ENTITY,
  UploadedImageFile,
  validateImageFile,
} from 'src/infrastructure/storage/image-validation';
import { serveImage } from 'src/infrastructure/storage/serve-image';
import { AuditService } from '../audit/audit.service';
import { AuditAction, AuditEntity } from '../audit/audit.constants';
import {
  ConsultationRow,
  ConsultationsRepository,
} from './repositories/consultations.repository';
import {
  CreateConsultationDto,
  GetConsultationsDto,
  UpdateConsultationDto,
} from './dto/consultation.dto';

/**
 * Mapeo de la API a la BD (columnas existentes):
 *   description -> notes, dentistObservations -> observations.
 * El nombre del archivo almacenado nunca sale en la API: se expone la URL del
 * endpoint autenticado de descarga.
 */
export function toConsultationResponse(row: ConsultationRow) {
  return {
    id: row.id,
    appointment_id: row.appointment_id,
    description: row.notes,
    dentistObservations: row.observations,
    created_at: row.created_at,
    updated_at: row.updated_at,
    created_by_id: row.created_by_id,
    updated_by_id: row.updated_by_id,
    appointment: {
      id: row.appointment.id,
      scheduled_at: row.appointment.scheduled_at,
      status: row.appointment.status,
      service: row.appointment.service,
    },
    patient: {
      id: row.appointment.patient.id,
      name: row.appointment.patient.user.name,
      lastname: row.appointment.patient.user.lastname,
    },
    images: row.images.map((image) => ({
      id: image.id,
      url: `/consultations/${row.id}/images/${image.id}`,
    })),
  };
}

@Injectable()
export class ConsultationsService {
  constructor(
    private repository: ConsultationsRepository,
    private prisma: PrismaService,
    private auditService: AuditService,
    private storage: FileStorageService,
  ) {}

  async getAll(filters: GetConsultationsDto) {
    const from = filters.from
      ? parseDateInput(filters.from, 'start')
      : undefined;
    const to = filters.to ? parseDateInput(filters.to, 'end') : undefined;
    if ((filters.from && !from) || (filters.to && !to)) {
      throw new BadRequestException('El rango de fechas no es válido');
    }
    if (from && to && from.getTime() > to.getTime()) {
      throw new BadRequestException(
        'La fecha inicial no puede ser posterior a la fecha final',
      );
    }

    const { page, limit } = resolvePagination(filters);
    const { items, total } = await this.repository.getAll({
      ...filters,
      from: from ?? undefined,
      to: to ?? undefined,
    });

    return { items: items.map(toConsultationResponse), total, page, limit };
  }

  async getById(id: number) {
    const consultation = await this.repository.getById(id);
    if (!consultation) throw new NotFoundException('La consulta no existe');

    return toConsultationResponse(consultation);
  }

  async create(dto: CreateConsultationDto, actorId: number) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const appointment = await this.repository.getAppointmentForConsultation(
          dto.appointment_id,
          tx,
        );
        if (!appointment) throw new NotFoundException('La cita no existe');

        // Solo se registra la consulta de una cita ya completada
        if (appointment.status !== AppointmentStatus.COMPLETADA) {
          throw new ConflictException(
            'Solo se puede registrar la consulta de una cita completada',
          );
        }
        if (appointment.consultation) {
          throw new ConflictException(
            'La cita ya tiene una consulta registrada',
          );
        }

        const created = await this.repository.create(
          {
            appointment_id: appointment.id,
            notes: dto.description.trim(),
            observations: (dto.dentistObservations ?? '').trim(),
            created_by_id: actorId,
          },
          tx,
        );

        // Notificacion generica: sin ningun dato clinico
        await this.repository.createNotification(
          {
            type: 'CONSULTA_REGISTRADA',
            message: `Se registró la consulta de tu cita del ${formatDateTime(appointment.scheduled_at)}`,
            user_id: appointment.patient.user_id,
            appointment_id: appointment.id,
          },
          tx,
        );

        // Solo ids y accion: nunca el contenido clinico
        await this.auditService.log(
          {
            userId: actorId,
            action: AuditAction.CONSULTATION_CREATED,
            entity: AuditEntity.CONSULTATION,
            entityId: created.id,
            after: { appointmentId: appointment.id },
          },
          tx,
        );

        return toConsultationResponse(created);
      }, TX_OPTIONS);
    } catch (error) {
      // Carrera: dos altas simultaneas; gana el UNIQUE(appointment_id)
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('La cita ya tiene una consulta registrada');
      }
      throw error;
    }
  }

  /**
   * Regla de modificacion: solo ADMIN (controller). Una consulta existe
   * unicamente sobre una cita COMPLETADA, y COMPLETADA es un estado final,
   * asi que mientras la consulta exista se puede editar; cada cambio queda
   * auditado (quien, cuando y que campos, sin el contenido).
   */
  async update(id: number, dto: UpdateConsultationDto, actorId: number) {
    if (
      dto.description === undefined &&
      dto.dentistObservations === undefined
    ) {
      throw new BadRequestException('Envía al menos un campo para actualizar');
    }

    return await this.prisma.$transaction(async (tx) => {
      await this.repository.lockById(id, tx);
      const current = await this.repository.getById(id, tx);
      if (!current) throw new NotFoundException('La consulta no existe');

      const notes = dto.description?.trim();
      const observations = dto.dentistObservations?.trim();
      const data: { notes?: string; observations?: string } = {};
      const changedFields: string[] = [];

      if (notes !== undefined && notes !== current.notes) {
        data.notes = notes;
        changedFields.push('description');
      }
      if (observations !== undefined && observations !== current.observations) {
        data.observations = observations;
        changedFields.push('dentistObservations');
      }

      if (changedFields.length === 0) return toConsultationResponse(current);

      const updated = await this.repository.update(
        id,
        { ...data, updated_by_id: actorId },
        tx,
      );

      const appointment = await this.repository.getAppointmentForConsultation(
        current.appointment_id,
        tx,
      );
      if (appointment) {
        await this.repository.createNotification(
          {
            type: 'CONSULTA_ACTUALIZADA',
            message: `Se actualizó la consulta de tu cita del ${formatDateTime(appointment.scheduled_at)}`,
            user_id: appointment.patient.user_id,
            appointment_id: appointment.id,
          },
          tx,
        );
      }

      await this.auditService.log(
        {
          userId: actorId,
          action: AuditAction.CONSULTATION_UPDATED,
          entity: AuditEntity.CONSULTATION,
          entityId: id,
          after: { changedFields },
        },
        tx,
      );

      return toConsultationResponse(updated);
    }, TX_OPTIONS);
  }

  /** Sube 1..N imagenes; el total por consulta no puede pasar de 5. */
  async addImages(
    consultationId: number,
    files: UploadedImageFile[] | undefined,
    actorId: number,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Debes adjuntar al menos una imagen');
    }
    if (files.length > MAX_IMAGES_PER_ENTITY) {
      throw new BadRequestException(
        `Máximo ${MAX_IMAGES_PER_ENTITY} imágenes por consulta`,
      );
    }
    // Valida TODO antes de tocar el disco (tamano, mime y magic bytes)
    files.forEach((file) => validateImageFile(file));

    const savedNames: string[] = [];

    try {
      // Los archivos se guardan ANTES de abrir la transaccion (dentro solo hay
      // filas y lock); si algo falla, el catch los limpia.
      for (const file of files) {
        savedNames.push(await this.storage.save('consultations', file));
      }

      return await this.prisma.$transaction(async (tx) => {
        await this.repository.lockById(consultationId, tx);
        const current = await this.repository.getById(consultationId, tx);
        if (!current) throw new NotFoundException('La consulta no existe');

        const existing = await this.repository.countImages(consultationId, tx);
        if (existing + files.length > MAX_IMAGES_PER_ENTITY) {
          throw new BadRequestException(
            `Una consulta admite máximo ${MAX_IMAGES_PER_ENTITY} imágenes (ya tiene ${existing})`,
          );
        }

        for (const name of savedNames) {
          await this.repository.createImage(consultationId, name, tx);
        }

        await this.auditService.log(
          {
            userId: actorId,
            action: AuditAction.CONSULTATION_IMAGE_ADDED,
            entity: AuditEntity.CONSULTATION,
            entityId: consultationId,
            after: { added: files.length },
          },
          tx,
        );

        const updated = await this.repository.getById(consultationId, tx);
        return toConsultationResponse(updated!);
      }, TX_OPTIONS);
    } catch (error) {
      // La transaccion fallo: no quedan archivos huerfanos
      await this.storage.removeMany('consultations', savedNames);
      throw error;
    }
  }

  async deleteImage(consultationId: number, imageId: number, actorId: number) {
    const removedName = await this.prisma.$transaction(async (tx) => {
      await this.repository.lockById(consultationId, tx);
      const image = await this.repository.findImage(
        consultationId,
        imageId,
        tx,
      );
      if (!image) throw new NotFoundException('La imagen no existe');

      await this.repository.deleteImage(image.id, tx);
      await this.auditService.log(
        {
          userId: actorId,
          action: AuditAction.CONSULTATION_IMAGE_DELETED,
          entity: AuditEntity.CONSULTATION,
          entityId: consultationId,
          after: { imageId },
        },
        tx,
      );

      return image.url;
    }, TX_OPTIONS);

    // Solo tras el commit se borra el archivo
    await this.storage.remove('consultations', removedName);

    return { id: imageId, deleted: true };
  }

  /** La imagen se sirve solo si pertenece a la consulta indicada. */
  async serveImage(consultationId: number, imageId: number, res: Response) {
    const image = await this.repository.findImage(consultationId, imageId);
    if (!image) throw new NotFoundException('La imagen no existe');

    return await serveImage(
      this.storage,
      'consultations',
      image.url,
      res,
      'private',
    );
  }
}
