import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { resolvePagination } from 'src/infrastructure/common/dto/pagination.dto';
import { GetFaqDto } from '../dto/faq.dto';

const PUBLIC_SELECT = { id: true, question: true, response: true } as const;

@Injectable()
export class FaqRepository {
  constructor(private prisma: PrismaService) {}

  async getAll(
    filters: GetFaqDto,
    options: { onlyActive: boolean; publicFields: boolean },
  ) {
    const { skip, take } = resolvePagination(filters);
    const where: Prisma.FrequentlyAskedQuestionWhereInput = {
      status: options.onlyActive ? true : filters.status,
      OR: filters.search
        ? [
            { question: { contains: filters.search, mode: 'insensitive' } },
            { response: { contains: filters.search, mode: 'insensitive' } },
          ]
        : undefined,
    };

    const [items, total] = await Promise.all([
      this.prisma.frequentlyAskedQuestion.findMany({
        where,
        orderBy: [{ id: 'asc' }],
        skip,
        take,
        select: options.publicFields ? PUBLIC_SELECT : undefined,
      }),
      this.prisma.frequentlyAskedQuestion.count({ where }),
    ]);

    return { items, total };
  }

  async getById(id: number, tx?: Prisma.TransactionClient) {
    const client = tx ?? this.prisma;
    return await client.frequentlyAskedQuestion.findUnique({ where: { id } });
  }

  /** Bloquea la fila (SELECT ... FOR UPDATE) hasta el fin de la transaccion. */
  async lockById(id: number, tx: Prisma.TransactionClient) {
    await tx.$queryRaw`SELECT id FROM frequently_asked_questions WHERE id = ${id} FOR UPDATE`;
  }

  async create(
    data: { question: string; response: string; status?: boolean },
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;
    return await client.frequentlyAskedQuestion.create({ data });
  }

  async update(
    id: number,
    data: { question?: string; response?: string; status?: boolean },
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;
    return await client.frequentlyAskedQuestion.update({
      where: { id },
      data,
    });
  }

  async delete(id: number, tx?: Prisma.TransactionClient) {
    const client = tx ?? this.prisma;
    await client.frequentlyAskedQuestion.delete({ where: { id } });
  }
}
