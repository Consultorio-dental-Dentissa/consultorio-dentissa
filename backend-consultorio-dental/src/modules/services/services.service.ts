import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Response } from 'express';
import { FileStorageService } from 'src/infrastructure/storage/file-storage.service';
import {
  MAX_IMAGES_PER_ENTITY,
  UploadedImageFile,
  validateImageFile,
} from 'src/infrastructure/storage/image-validation';
import { serveImage } from 'src/infrastructure/storage/serve-image';
import { ServicesRepository } from './repositories/services.repository';
import { CreateServiceDto } from './dto/create-service.dto';
import { GetServicesDto } from './dto/get-services.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Role } from '../users/enums/rol.enum';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { TX_OPTIONS } from 'src/infrastructure/prisma/transaction-options';
import { resolvePagination } from 'src/infrastructure/common/dto/pagination.dto';
import { AuditService } from '../audit/audit.service';
import { AuditAction, AuditEntity } from '../audit/audit.constants';

@Injectable()
export class ServicesService {
  constructor(
    private servicesRepository: ServicesRepository,
    private prisma: PrismaService,
    private auditService: AuditService,
    private storage: FileStorageService,
  ) {}

  /** Sin el nombre de archivo almacenado: solo la URL publica de la imagen. */
  private withImageUrls<T extends { id: number; images?: { id: number }[] }>(
    service: T,
  ) {
    return {
      ...service,
      images: (service.images ?? []).map((image) => ({
        id: image.id,
        url: `/services/${service.id}/images/${image.id}`,
      })),
    };
  }

  async getAllServices(filters?: GetServicesDto, user?: { role?: string }) {
    /**
     * Solo un ADMIN autenticado puede ver servicios inactivos.
     * Para cualquier otro caso (publico, paciente, asistente) se fuerza status activo.
     */
    const isAdmin = user?.role === Role.ADMINISTRADOR;

    const { page, limit } = resolvePagination(filters);
    const { items, total } = await this.servicesRepository.getAll({
      ...filters,
      status: isAdmin ? filters?.status : true,
    });

    return {
      items: items.map((service) => this.withImageUrls(service)),
      total,
      page,
      limit,
    };
  }

  /** Sube 1..N imagenes; el total por servicio no puede pasar de 5. */
  async addImages(
    serviceId: number,
    files: UploadedImageFile[] | undefined,
    actorId: number,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Debes adjuntar al menos una imagen');
    }
    if (files.length > MAX_IMAGES_PER_ENTITY) {
      throw new BadRequestException(
        `Máximo ${MAX_IMAGES_PER_ENTITY} imágenes por servicio`,
      );
    }
    files.forEach((file) => validateImageFile(file));

    // Los archivos se guardan ANTES de abrir la transaccion (dentro solo hay
    // filas y lock); si algo falla, se limpian.
    const savedNames: string[] = [];

    try {
      for (const file of files) {
        savedNames.push(await this.storage.save('services', file));
      }

      return await this.prisma.$transaction(async (tx) => {
        await this.servicesRepository.lockById(serviceId, tx);
        if (!(await this.servicesRepository.getById(serviceId, tx))) {
          throw new NotFoundException('El servicio no existe');
        }

        const existing = await this.servicesRepository.countImages(
          serviceId,
          tx,
        );
        if (existing + files.length > MAX_IMAGES_PER_ENTITY) {
          throw new BadRequestException(
            `Un servicio admite máximo ${MAX_IMAGES_PER_ENTITY} imágenes (ya tiene ${existing})`,
          );
        }

        for (const name of savedNames) {
          await this.servicesRepository.createImage(serviceId, name, tx);
        }

        await this.auditService.log(
          {
            userId: actorId,
            action: AuditAction.SERVICE_IMAGE_ADDED,
            entity: AuditEntity.SERVICE,
            entityId: serviceId,
            after: { added: files.length },
          },
          tx,
        );

        return this.withImageUrls(
          (await this.servicesRepository.getWithImages(serviceId, tx))!,
        );
      }, TX_OPTIONS);
    } catch (error) {
      await this.storage.removeMany('services', savedNames);
      throw error;
    }
  }

  /** Reemplaza el archivo de una imagen y borra el anterior. */
  async replaceImage(
    serviceId: number,
    imageId: number,
    file: UploadedImageFile | undefined,
    actorId: number,
  ) {
    if (!file) throw new BadRequestException('Debes adjuntar una imagen');
    validateImageFile(file);

    // Archivo nuevo guardado antes de la transaccion; el anterior se borra
    // solo despues del commit.
    const newName = await this.storage.save('services', file);

    let oldName: string;
    try {
      oldName = await this.prisma.$transaction(async (tx) => {
        await this.servicesRepository.lockById(serviceId, tx);
        const image = await this.servicesRepository.findImage(
          serviceId,
          imageId,
          tx,
        );
        if (!image) throw new NotFoundException('La imagen no existe');

        await this.servicesRepository.replaceImageFile(imageId, newName, tx);
        await this.auditService.log(
          {
            userId: actorId,
            action: AuditAction.SERVICE_IMAGE_REPLACED,
            entity: AuditEntity.SERVICE,
            entityId: serviceId,
            after: { imageId },
          },
          tx,
        );

        return image.url;
      }, TX_OPTIONS);
    } catch (error) {
      // La transaccion fallo: el archivo nuevo quedo huerfano y se borra
      await this.storage.remove('services', newName);
      throw error;
    }

    await this.storage.remove('services', oldName);

    return this.withImageUrls(
      (await this.servicesRepository.getWithImages(serviceId))!,
    );
  }

  async deleteImage(serviceId: number, imageId: number, actorId: number) {
    const removedName = await this.prisma.$transaction(async (tx) => {
      await this.servicesRepository.lockById(serviceId, tx);
      const image = await this.servicesRepository.findImage(
        serviceId,
        imageId,
        tx,
      );
      if (!image) throw new NotFoundException('La imagen no existe');

      // Spec 02: un servicio ACTIVO conserva entre 1 y 5 imagenes. Uno
      // inactivo si puede quedarse sin imagenes (pero no se puede activar asi).
      const total = await this.servicesRepository.countImages(serviceId, tx);
      if (image.service.status && total <= 1) {
        throw new ConflictException(
          'Un servicio activo debe conservar al menos una imagen. Sube otra o reemplaza esta antes de eliminarla, o desactiva el servicio',
        );
      }

      await this.servicesRepository.deleteImage(image.id, tx);
      await this.auditService.log(
        {
          userId: actorId,
          action: AuditAction.SERVICE_IMAGE_DELETED,
          entity: AuditEntity.SERVICE,
          entityId: serviceId,
          after: { imageId },
        },
        tx,
      );

      return image.url;
    }, TX_OPTIONS);

    await this.storage.remove('services', removedName);

    return { id: imageId, deleted: true };
  }

  /** Publico para servicios activos; los inactivos solo los ve un ADMIN. */
  async serveImage(
    serviceId: number,
    imageId: number,
    user: { role?: string } | undefined,
    res: Response,
  ) {
    const image = await this.servicesRepository.findImage(serviceId, imageId);
    const visible =
      image && (image.service.status || user?.role === Role.ADMINISTRADOR);
    if (!image || !visible) throw new NotFoundException('La imagen no existe');

    // Cacheable publicamente solo si el servicio esta activo; la vista previa
    // de un servicio inactivo (admin) no debe quedar en caches compartidas.
    return await serveImage(
      this.storage,
      'services',
      image.url,
      res,
      image.service.status ? 'public' : 'private',
    );
  }

  async updateServiceStatus(id: number, estado: boolean, actorId?: number) {
    return await this.prisma.$transaction(async (tx) => {
      await this.servicesRepository.lockById(id, tx);
      const current = await this.servicesRepository.getById(id, tx);

      if (!current) {
        throw new NotFoundException('El servicio no existe');
      }

      // Spec 02: un servicio activo tiene entre 1 y 5 imagenes
      if (estado && (await this.servicesRepository.countImages(id, tx)) === 0) {
        throw new ConflictException(
          'No se puede activar un servicio sin imágenes. Sube al menos una imagen primero',
        );
      }

      const updated = await this.servicesRepository.updateStatus(
        id,
        estado,
        tx,
      );

      await this.auditService.log(
        {
          userId: actorId,
          action: AuditAction.SERVICE_STATUS_CHANGED,
          entity: AuditEntity.SERVICE,
          entityId: id,
          before: { status: current.status },
          after: { status: estado },
        },
        tx,
      );

      return updated;
    }, TX_OPTIONS);
  }

  /** El servicio nace INACTIVO: las imagenes se suben despues y luego se activa. */
  async createService(createServiceDto: CreateServiceDto, actorId?: number) {
    if (
      createServiceDto.durationMinutes < 15 ||
      createServiceDto.durationMinutes > 120
    ) {
      throw new BadRequestException(
        'El servicio debe durar minimo 15 minutos y maximo 2 horas',
      );
    }

    const isNameUsed = await this.servicesRepository.existByName(
      createServiceDto.name,
    );

    if (isNameUsed) {
      throw new BadRequestException('Ya existe un servicio con este nombre');
    }

    return await this.prisma.$transaction(async (tx) => {
      const service = await this.servicesRepository.create(
        createServiceDto,
        tx,
      );

      await this.auditService.log(
        {
          userId: actorId,
          action: AuditAction.SERVICE_CREATED,
          entity: AuditEntity.SERVICE,
          entityId: service.id,
          after: {
            name: service.name,
            durationMinutes: service.durationMinutes,
            price: service.price,
            status: service.status,
          },
        },
        tx,
      );

      return service;
    }, TX_OPTIONS);
  }

  /**
   * Edicion parcial por el ADMIN (PATCH /services/:id). No toca `status` ni
   * imagenes. Las citas ya creadas conservan su propia durationMinutes
   * (la duracion se copia a la cita al agendar). Sin cambios reales: sin
   * escritura ni auditoria.
   */
  async updateService(id: number, dto: UpdateServiceDto, actorId?: number) {
    if (
      dto.name === undefined &&
      dto.description === undefined &&
      dto.price === undefined &&
      dto.durationMinutes === undefined
    ) {
      throw new BadRequestException('Envía al menos un campo para actualizar');
    }

    if (
      dto.durationMinutes !== undefined &&
      (dto.durationMinutes < 15 || dto.durationMinutes > 120)
    ) {
      throw new BadRequestException(
        'El servicio debe durar minimo 15 minutos y maximo 2 horas',
      );
    }

    return await this.prisma.$transaction(async (tx) => {
      await this.servicesRepository.lockById(id, tx);
      const current = await this.servicesRepository.getById(id, tx);

      if (!current) {
        throw new NotFoundException('El servicio no existe');
      }

      const data: {
        name?: string;
        description?: string;
        price?: number;
        durationMinutes?: number;
      } = {};
      const changedFields: string[] = [];

      if (dto.name !== undefined && dto.name !== current.name) {
        if (
          await this.servicesRepository.isNameTakenByOther(dto.name, id, tx)
        ) {
          throw new BadRequestException(
            'Ya existe un servicio con este nombre',
          );
        }
        data.name = dto.name;
        changedFields.push('name');
      }
      if (
        dto.description !== undefined &&
        dto.description !== current.description
      ) {
        data.description = dto.description;
        changedFields.push('description');
      }
      if (dto.price !== undefined && dto.price !== Number(current.price)) {
        data.price = dto.price;
        changedFields.push('price');
      }
      if (
        dto.durationMinutes !== undefined &&
        dto.durationMinutes !== current.durationMinutes
      ) {
        data.durationMinutes = dto.durationMinutes;
        changedFields.push('durationMinutes');
      }

      if (changedFields.length === 0) {
        return this.withImageUrls(
          (await this.servicesRepository.getWithImages(id, tx))!,
        );
      }

      await this.servicesRepository.applyUpdate(id, data, tx);

      await this.auditService.log(
        {
          userId: actorId,
          action: AuditAction.SERVICE_UPDATED,
          entity: AuditEntity.SERVICE,
          entityId: id,
          after: { changedFields },
        },
        tx,
      );

      return this.withImageUrls(
        (await this.servicesRepository.getWithImages(id, tx))!,
      );
    }, TX_OPTIONS);
  }
}
