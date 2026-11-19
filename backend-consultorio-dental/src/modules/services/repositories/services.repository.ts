import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateServiceDto } from '../dto/create-service.dto';
import { GetServicesDto } from '../dto/get-services.dto';
import { resolvePagination } from 'src/infrastructure/common/dto/pagination.dto';

const IMAGES_INCLUDE = {
  images: { select: { id: true, url: true }, orderBy: { id: 'asc' } },
} satisfies Prisma.ServiceInclude;

@Injectable()
export class ServicesRepository {
  constructor(private prisma: PrismaService) {}

  async getAll(filters?: GetServicesDto) {
    /**
     * INDICACIÓN:
     * "price" es un campo Decimal, no un texto, así que no
     * se puede buscar con "contains" como el resto de los
     * campos. Si lo que se escribió en la búsqueda es un
     * número válido, además de buscar por nombre, se
     * agrega una comparación exacta contra el precio.
     */
    const searchAsPrice = filters?.search ? Number(filters.search) : NaN;

    const { skip, take } = resolvePagination(filters);
    const where: Prisma.ServiceWhereInput = {
      status: filters?.status,
      OR: filters?.search
        ? [
            { name: { contains: filters.search, mode: 'insensitive' } },
            ...(Number.isNaN(searchAsPrice) ? [] : [{ price: searchAsPrice }]),
          ]
        : undefined,
    };

    const [items, total] = await Promise.all([
      this.prisma.service.findMany({
        include: IMAGES_INCLUDE,
        orderBy: { id: 'asc' },
        where,
        skip,
        take,
      }),
      this.prisma.service.count({ where }),
    ]);

    return { items, total };
  }

  async existByName(name: string) {
    return await this.prisma.service.findFirst({
      where: {
        name: name,
      },
    });
  }

  async create(
    createServiceDto: CreateServiceDto,
    transaction?: Prisma.TransactionClient,
  ) {
    const client = transaction ?? this.prisma;

    return await client.service.create({
      data: {
        // Un servicio nuevo no tiene imagenes (spec 02: 1-5): nace inactivo
        // y solo puede activarse cuando tenga al menos una.
        status: false,
        name: createServiceDto.name,
        durationMinutes: createServiceDto.durationMinutes,
        price: createServiceDto.price,
        description: createServiceDto.description,
      },
    });
  }

  async delete(id: number) {
    const service = await this.prisma.service.delete({
      where: {
        id: id,
      },
    });

    return service ? true : false;
  }

  async updateStatus(
    id: number,
    status: boolean,
    transaction?: Prisma.TransactionClient,
  ) {
    const client = transaction ?? this.prisma;
    const service = await client.service.update({
      where: {
        id: id,
      },
      data: {
        status: status,
      },
    });

    return service ? true : false;
  }

  async exitstById(id: number) {
    return (await this.prisma.service.count({
      where: {
        id: id,
      },
    })) > 0
      ? true
      : false;
  }

  async getById(id: number, transaction?: Prisma.TransactionClient) {
    const client = transaction ?? this.prisma;
    return await client.service.findUnique({
      where: {
        id: id,
      },
    });
  }

  /** Bloquea la fila del servicio (SELECT ... FOR UPDATE) hasta el fin de la transaccion. */
  async lockById(id: number, tx: Prisma.TransactionClient) {
    await tx.$queryRaw`SELECT id FROM services WHERE id = ${id} FOR UPDATE`;
  }

  async countImages(serviceId: number, tx: Prisma.TransactionClient) {
    return await tx.serviceImage.count({ where: { service_id: serviceId } });
  }

  async createImage(
    serviceId: number,
    storedName: string,
    tx: Prisma.TransactionClient,
  ) {
    return await tx.serviceImage.create({
      data: { service_id: serviceId, url: storedName },
      select: { id: true, url: true },
    });
  }

  /** La imagen solo se encuentra si pertenece a ESE servicio (ownership). */
  async findImage(
    serviceId: number,
    imageId: number,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;
    return await client.serviceImage.findFirst({
      where: { id: imageId, service_id: serviceId },
      select: { id: true, url: true, service: { select: { status: true } } },
    });
  }

  async replaceImageFile(
    imageId: number,
    storedName: string,
    tx: Prisma.TransactionClient,
  ) {
    await tx.serviceImage.update({
      where: { id: imageId },
      data: { url: storedName },
    });
  }

  async deleteImage(imageId: number, tx: Prisma.TransactionClient) {
    await tx.serviceImage.delete({ where: { id: imageId } });
  }

  async getWithImages(id: number, tx?: Prisma.TransactionClient) {
    const client = tx ?? this.prisma;
    return await client.service.findUnique({
      where: { id },
      include: IMAGES_INCLUDE,
    });
  }

  /** Nombre ya usado por OTRO servicio (sin distinguir mayusculas). */
  async isNameTakenByOther(
    name: string,
    id: number,
    tx: Prisma.TransactionClient,
  ) {
    return (
      (await tx.service.count({
        where: { name: { equals: name, mode: 'insensitive' }, id: { not: id } },
      })) > 0
    );
  }

  async applyUpdate(
    id: number,
    data: Prisma.ServiceUpdateInput,
    tx: Prisma.TransactionClient,
  ) {
    await tx.service.update({ where: { id }, data });
  }
}
