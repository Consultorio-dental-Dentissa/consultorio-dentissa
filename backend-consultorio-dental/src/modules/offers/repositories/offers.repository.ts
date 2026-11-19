import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { resolvePagination } from 'src/infrastructure/common/dto/pagination.dto';

export interface OfferFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: boolean;
  /** Ofertas cuya vigencia intersecta el intervalo [dayStart, dayEnd). */
  validDay?: { start: Date; end: Date };
  /** Ofertas vigentes en este instante exacto (start_date <= at <= end_date). */
  activeAt?: Date;
}

const ADMIN_INCLUDE = {
  services: {
    select: { service: { select: { id: true, name: true, status: true } } },
  },
} satisfies Prisma.OfferInclude;

@Injectable()
export class OffersRepository {
  constructor(private prisma: PrismaService) {}

  private buildWhere(filters: OfferFilters): Prisma.OfferWhereInput {
    return {
      status: filters.status,
      name: filters.search
        ? { contains: filters.search, mode: 'insensitive' }
        : undefined,
      start_date: filters.activeAt
        ? { lte: filters.activeAt }
        : filters.validDay
          ? { lt: filters.validDay.end }
          : undefined,
      end_date: filters.activeAt
        ? { gte: filters.activeAt }
        : filters.validDay
          ? { gte: filters.validDay.start }
          : undefined,
    };
  }

  async getAllAdmin(filters: OfferFilters) {
    const { skip, take } = resolvePagination(filters);
    const where = this.buildWhere(filters);

    const [items, total] = await Promise.all([
      this.prisma.offer.findMany({
        where,
        orderBy: [{ start_date: 'desc' }, { id: 'desc' }],
        skip,
        take,
        include: ADMIN_INCLUDE,
      }),
      this.prisma.offer.count({ where }),
    ]);

    return { items, total };
  }

  /** Campos minimos para la web publica (sin estado ni fechas de auditoria). */
  async getAllPublic(filters: OfferFilters) {
    const { skip, take } = resolvePagination(filters);
    const where = this.buildWhere(filters);

    const [items, total] = await Promise.all([
      this.prisma.offer.findMany({
        where,
        orderBy: [{ start_date: 'desc' }, { id: 'desc' }],
        skip,
        take,
        select: {
          id: true,
          name: true,
          description: true,
          image: true,
          start_date: true,
          end_date: true,
          services: {
            where: { service: { status: true } },
            select: { service: { select: { id: true, name: true } } },
          },
        },
      }),
      this.prisma.offer.count({ where }),
    ]);

    return { items, total };
  }

  async getById(id: number, tx?: Prisma.TransactionClient) {
    const client = tx ?? this.prisma;
    return await client.offer.findUnique({
      where: { id },
      include: ADMIN_INCLUDE,
    });
  }

  /** Datos minimos para decidir si la imagen de una oferta puede servirse. */
  async getImageInfo(id: number) {
    return await this.prisma.offer.findUnique({
      where: { id },
      select: { image: true, status: true, start_date: true, end_date: true },
    });
  }

  async setImage(
    id: number,
    image: string | null,
    tx: Prisma.TransactionClient,
  ) {
    await tx.offer.update({ where: { id }, data: { image } });
  }

  /** Bloquea la fila (SELECT ... FOR UPDATE) hasta el fin de la transaccion. */
  async lockById(id: number, tx: Prisma.TransactionClient) {
    await tx.$queryRaw`SELECT id FROM offers WHERE id = ${id} FOR UPDATE`;
  }

  /** Cuenta los servicios existentes Y activos entre los IDs recibidos. */
  async countActiveServices(ids: number[], tx?: Prisma.TransactionClient) {
    const client = tx ?? this.prisma;
    return await client.service.count({
      where: { id: { in: ids }, status: true },
    });
  }

  async create(
    data: {
      name: string;
      description: string;
      start_date: Date;
      end_date: Date;
      status?: boolean;
      serviceIds?: number[];
    },
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;
    const { serviceIds, ...offer } = data;

    return await client.offer.create({
      data: {
        ...offer,
        services: serviceIds?.length
          ? { create: serviceIds.map((service_id) => ({ service_id })) }
          : undefined,
      },
      include: ADMIN_INCLUDE,
    });
  }

  async update(
    id: number,
    data: {
      name?: string;
      description?: string;
      start_date?: Date;
      end_date?: Date;
      status?: boolean;
      serviceIds?: number[];
    },
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;
    const { serviceIds, ...offer } = data;

    if (serviceIds) {
      await client.serviceOffer.deleteMany({ where: { offer_id: id } });
    }

    return await client.offer.update({
      where: { id },
      data: {
        ...offer,
        services: serviceIds?.length
          ? { create: serviceIds.map((service_id) => ({ service_id })) }
          : undefined,
      },
      include: ADMIN_INCLUDE,
    });
  }

  async delete(id: number, tx?: Prisma.TransactionClient) {
    const client = tx ?? this.prisma;
    await client.serviceOffer.deleteMany({ where: { offer_id: id } });
    await client.offer.delete({ where: { id } });
  }
}
