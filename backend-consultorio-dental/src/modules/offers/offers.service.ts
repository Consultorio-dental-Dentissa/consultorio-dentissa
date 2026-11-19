import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Response } from 'express';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { TX_OPTIONS } from 'src/infrastructure/prisma/transaction-options';
import { FileStorageService } from 'src/infrastructure/storage/file-storage.service';
import {
  UploadedImageFile,
  validateImageFile,
} from 'src/infrastructure/storage/image-validation';
import { serveImage } from 'src/infrastructure/storage/serve-image';
import { resolvePagination } from 'src/infrastructure/common/dto/pagination.dto';
import { getDayBounds } from 'src/infrastructure/common/utils/timezone';
import {
  dayBoundsOf,
  parseDateInput,
} from 'src/infrastructure/common/utils/date-input';
import { OffersRepository } from './repositories/offers.repository';
import { AuditService } from '../audit/audit.service';
import { AuditAction, AuditEntity } from '../audit/audit.constants';
import { CreateOfferDto, GetOffersDto, UpdateOfferDto } from './dto/offer.dto';

/**
 * Convierte la fecha recibida a instante UTC. Acepta solo AAAA-MM-DD (dia
 * local del consultorio: inicio 00:00, fin 23:59:59.999) o fecha-hora ISO con
 * zona explicita (Z u offset). Cualquier otra forma o fecha inexistente => 400.
 */
export function parseOfferDate(value: string, edge: 'start' | 'end'): Date {
  const parsed = parseDateInput(value, edge);
  if (!parsed) {
    throw new BadRequestException(
      'La fecha no es válida. Usa AAAA-MM-DD o fecha-hora ISO 8601 con zona (Z u offset)',
    );
  }
  return parsed;
}

type OfferData = {
  name: string;
  start_date: Date;
  end_date: Date;
  status: boolean;
  services: { service: { id: number } }[];
};

function snapshot(offer: OfferData) {
  return {
    name: offer.name,
    start_date: offer.start_date,
    end_date: offer.end_date,
    status: offer.status,
    serviceIds: offer.services.map((s) => s.service.id),
  };
}

@Injectable()
export class OffersService {
  constructor(
    private offersRepository: OffersRepository,
    private prisma: PrismaService,
    private auditService: AuditService,
    private storage: FileStorageService,
  ) {}

  /** Publico: solo activas y vigentes en este instante; ignora status/date. */
  async getPublic(filters: GetOffersDto) {
    const { page, limit } = resolvePagination(filters);
    const { items, total } = await this.offersRepository.getAllPublic({
      ...filters,
      status: true,
      validDay: undefined,
      activeAt: new Date(),
    });

    return { items: items.map((o) => this.flatten(o)), total, page, limit };
  }

  async getAdmin(filters: GetOffersDto) {
    const { page, limit } = resolvePagination(filters);
    const { items, total } = await this.offersRepository.getAllAdmin({
      ...filters,
      validDay: filters.date ? dayBoundsOf(filters.date) : undefined,
    });

    return {
      items: items.map((o) => this.flatten(o, 'admin')),
      total,
      page,
      limit,
    };
  }

  async getById(id: number) {
    const offer = await this.offersRepository.getById(id);
    if (!offer) throw new NotFoundException('La oferta no existe');

    return this.flatten(offer, 'admin');
  }

  /**
   * Aplana los servicios y sustituye el nombre de archivo almacenado por la
   * URL del endpoint que sirve la imagen (null si no tiene).
   */
  private flatten<
    T extends {
      id: number;
      services: { service: unknown }[];
      image?: string | null;
    },
  >(offer: T, scope: 'public' | 'admin' = 'public') {
    const { image, ...rest } = offer;
    return {
      ...rest,
      services: offer.services.map((s) => s.service),
      image_url: image
        ? scope === 'admin'
          ? `/offers/admin/${offer.id}/image`
          : `/offers/${offer.id}/image`
        : null,
    };
  }

  /** Sube o reemplaza la imagen de la oferta (una sola por oferta). */
  async setImage(
    id: number,
    file: UploadedImageFile | undefined,
    actorId: number,
  ) {
    if (!file) throw new BadRequestException('Debes adjuntar una imagen');
    validateImageFile(file);

    // Archivo guardado ANTES de la transaccion (dentro solo filas y lock)
    const name = await this.storage.save('offers', file);

    // El try/catch cubre SOLO la transaccion: si falla, se borra el archivo
    // nuevo; tras el commit nunca se borra (la fila ya lo referencia).
    let previous: string | null;
    let offer: NonNullable<Awaited<ReturnType<OffersRepository['getById']>>>;
    try {
      ({ previous, offer } = await this.prisma.$transaction(async (tx) => {
        await this.offersRepository.lockById(id, tx);
        const current = await this.offersRepository.getById(id, tx);
        if (!current) throw new NotFoundException('La oferta no existe');

        await this.offersRepository.setImage(id, name, tx);

        await this.auditService.log(
          {
            userId: actorId,
            action: AuditAction.OFFER_IMAGE_SET,
            entity: AuditEntity.OFFER,
            entityId: id,
            after: { replaced: !!current.image },
          },
          tx,
        );

        return {
          previous: current.image,
          offer: { ...current, image: name },
        };
      }, TX_OPTIONS));
    } catch (error) {
      await this.storage.remove('offers', name);
      throw error;
    }

    // Reemplazo: el archivo anterior ya no tiene referencias
    await this.storage.remove('offers', previous);

    return this.flatten(offer, 'admin');
  }

  async removeImage(id: number, actorId: number) {
    const previous = await this.prisma.$transaction(async (tx) => {
      await this.offersRepository.lockById(id, tx);
      const current = await this.offersRepository.getById(id, tx);
      if (!current) throw new NotFoundException('La oferta no existe');
      if (!current.image) return null;

      await this.offersRepository.setImage(id, null, tx);
      await this.auditService.log(
        {
          userId: actorId,
          action: AuditAction.OFFER_IMAGE_REMOVED,
          entity: AuditEntity.OFFER,
          entityId: id,
        },
        tx,
      );

      return current.image;
    }, TX_OPTIONS);

    await this.storage.remove('offers', previous);

    return { id, image_url: null };
  }

  /**
   * Publico: solo si la oferta esta activa y vigente (igual que el listado
   * publico). `asAdmin` permite previsualizar ofertas inactivas.
   */
  async serveImage(id: number, asAdmin: boolean, res: Response) {
    const info = await this.offersRepository.getImageInfo(id);
    const now = Date.now();
    const publicVisible =
      !!info &&
      info.status &&
      info.start_date.getTime() <= now &&
      info.end_date.getTime() >= now;

    if (!info || !info.image || !(asAdmin || publicVisible)) {
      throw new NotFoundException('La imagen no existe');
    }

    return await serveImage(
      this.storage,
      'offers',
      info.image,
      res,
      asAdmin ? 'private' : 'public',
    );
  }

  private assertDates(start: Date, end: Date) {
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new BadRequestException('Las fechas de la oferta no son válidas');
    }
    if (start.getTime() > end.getTime()) {
      throw new BadRequestException(
        'La fecha de inicio no puede ser posterior a la fecha de fin',
      );
    }
  }

  /** Los servicios asociados deben existir y estar activos. */
  private async assertServicesUsable(
    ids: number[] | undefined,
    tx: Parameters<OffersRepository['countActiveServices']>[1],
  ) {
    if (!ids || ids.length === 0) return;
    const found = await this.offersRepository.countActiveServices(ids, tx);
    if (found !== ids.length) {
      throw new BadRequestException(
        'Alguno de los servicios no existe o está inactivo',
      );
    }
  }

  async create(dto: CreateOfferDto, actorId: number) {
    const start = parseOfferDate(dto.start_date, 'start');
    const end = parseOfferDate(dto.end_date, 'end');
    this.assertDates(start, end);

    if (end.getTime() < getDayBounds(new Date()).start.getTime()) {
      throw new BadRequestException(
        'La fecha de fin de la oferta no puede estar en el pasado',
      );
    }

    return await this.prisma.$transaction(async (tx) => {
      await this.assertServicesUsable(dto.serviceIds, tx);

      const offer = await this.offersRepository.create(
        {
          name: dto.name.trim(),
          description: dto.description.trim(),
          start_date: start,
          end_date: end,
          status: dto.status,
          serviceIds: dto.serviceIds,
        },
        tx,
      );

      await this.auditService.log(
        {
          userId: actorId,
          action: AuditAction.OFFER_CREATED,
          entity: AuditEntity.OFFER,
          entityId: offer.id,
          after: snapshot(offer),
        },
        tx,
      );

      return this.flatten(offer, 'admin');
    }, TX_OPTIONS);
  }

  async update(id: number, dto: UpdateOfferDto, actorId: number) {
    if (
      dto.name === undefined &&
      dto.description === undefined &&
      dto.start_date === undefined &&
      dto.end_date === undefined &&
      dto.serviceIds === undefined
    ) {
      throw new BadRequestException('Envía al menos un campo para actualizar');
    }

    return await this.prisma.$transaction(async (tx) => {
      await this.offersRepository.lockById(id, tx);
      const current = await this.offersRepository.getById(id, tx);
      if (!current) throw new NotFoundException('La oferta no existe');

      const start =
        dto.start_date !== undefined
          ? parseOfferDate(dto.start_date, 'start')
          : new Date(current.start_date);
      const end =
        dto.end_date !== undefined
          ? parseOfferDate(dto.end_date, 'end')
          : new Date(current.end_date);
      this.assertDates(start, end);

      const currentIds = current.services.map((s) => s.service.id);
      const name = dto.name?.trim();
      const description = dto.description?.trim();
      const data: {
        name?: string;
        description?: string;
        start_date?: Date;
        end_date?: Date;
        serviceIds?: number[];
      } = {};

      if (name !== undefined && name !== current.name) data.name = name;
      if (description !== undefined && description !== current.description) {
        data.description = description;
      }
      if (
        dto.start_date !== undefined &&
        start.getTime() !== current.start_date.getTime()
      ) {
        data.start_date = start;
      }
      if (
        dto.end_date !== undefined &&
        end.getTime() !== current.end_date.getTime()
      ) {
        data.end_date = end;
      }
      if (dto.serviceIds !== undefined) {
        const same =
          dto.serviceIds.length === currentIds.length &&
          dto.serviceIds.every((sid) => currentIds.includes(sid));
        if (!same) {
          // Solo los servicios nuevos deben estar activos
          await this.assertServicesUsable(
            dto.serviceIds.filter((sid) => !currentIds.includes(sid)),
            tx,
          );
          data.serviceIds = dto.serviceIds;
        }
      }

      if (Object.keys(data).length === 0) return this.flatten(current, 'admin');

      const offer = await this.offersRepository.update(id, data, tx);

      const before = snapshot(current);
      const after = snapshot(offer);
      const changed = (Object.keys(before) as (keyof typeof before)[]).filter(
        (k) => JSON.stringify(before[k]) !== JSON.stringify(after[k]),
      );

      await this.auditService.log(
        {
          userId: actorId,
          action: AuditAction.OFFER_UPDATED,
          entity: AuditEntity.OFFER,
          entityId: id,
          before: Object.fromEntries(changed.map((k) => [k, before[k]])),
          after: Object.fromEntries(changed.map((k) => [k, after[k]])),
        },
        tx,
      );

      return this.flatten(offer, 'admin');
    }, TX_OPTIONS);
  }

  async updateStatus(id: number, status: boolean, actorId: number) {
    return await this.prisma.$transaction(async (tx) => {
      await this.offersRepository.lockById(id, tx);
      const current = await this.offersRepository.getById(id, tx);
      if (!current) throw new NotFoundException('La oferta no existe');
      if (current.status === status) return this.flatten(current, 'admin');

      const offer = await this.offersRepository.update(id, { status }, tx);

      await this.auditService.log(
        {
          userId: actorId,
          action: AuditAction.OFFER_STATUS_CHANGED,
          entity: AuditEntity.OFFER,
          entityId: id,
          before: { status: current.status },
          after: { status: offer.status },
        },
        tx,
      );

      return this.flatten(offer, 'admin');
    }, TX_OPTIONS);
  }

  async remove(id: number, actorId: number) {
    let imageName: string | null = null;

    const result = await this.prisma.$transaction(async (tx) => {
      await this.offersRepository.lockById(id, tx);
      const current = await this.offersRepository.getById(id, tx);
      if (!current) throw new NotFoundException('La oferta no existe');

      await this.offersRepository.delete(id, tx);
      imageName = current.image;

      await this.auditService.log(
        {
          userId: actorId,
          action: AuditAction.OFFER_DELETED,
          entity: AuditEntity.OFFER,
          entityId: id,
          before: snapshot(current),
        },
        tx,
      );

      return { id, deleted: true };
    }, TX_OPTIONS);

    // Tras el commit: la imagen de una oferta borrada ya no tiene referencias
    await this.storage.remove('offers', imageName);

    return result;
  }
}
