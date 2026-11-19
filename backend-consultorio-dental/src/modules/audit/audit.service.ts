import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { resolvePagination } from 'src/infrastructure/common/dto/pagination.dto';
import { parseDateInput } from 'src/infrastructure/common/utils/date-input';
import { GetAuditLogsDto } from './dto/get-audit-logs.dto';
import { sanitizeAuditData } from './audit-sanitize';

/** `from` solo-dia = inicio del dia local; `to` solo-dia = hasta el fin de ese dia. */
function resolveRange(filters: GetAuditLogsDto) {
  const from = filters.from ? parseDateInput(filters.from, 'start') : null;
  const to = filters.to ? parseDateInput(filters.to, 'end') : null;
  if ((filters.from && !from) || (filters.to && !to)) {
    throw new BadRequestException('El rango de fechas no es válido');
  }
  if (from && to && from.getTime() > to.getTime()) {
    throw new BadRequestException(
      'La fecha inicial no puede ser posterior a la fecha final',
    );
  }
  return { from, to };
}

export interface AuditEntry {
  userId?: number | null;
  action: string;
  entity: string;
  entityId?: number | null;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
}

/**
 * Registro de auditoria append-only: solo expone alta y consulta (nunca
 * edicion ni borrado). `before`/`after` se minimizan siempre antes de guardarse.
 */
@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  /** Pasa `tx` para que la auditoria viaje en la misma transaccion que la operacion. */
  async log(entry: AuditEntry, tx?: Prisma.TransactionClient) {
    const client = tx ?? this.prisma;

    await client.auditLog.create({
      data: {
        user_id: entry.userId ?? null,
        action: entry.action,
        entity: entry.entity,
        entity_id: entry.entityId ?? null,
        before: entry.before ? sanitizeAuditData(entry.before) : undefined,
        after: entry.after ? sanitizeAuditData(entry.after) : undefined,
      },
      select: { id: true },
    });
  }

  async findAll(filters: GetAuditLogsDto) {
    const { from, to } = resolveRange(filters);
    const { page, limit, skip, take } = resolvePagination(filters);
    const where: Prisma.AuditLogWhereInput = {
      action: filters.action,
      entity: filters.entity,
      user_id: filters.userId,
      entity_id: filters.entityId,
      created_at:
        from || to
          ? { gte: from ?? undefined, lte: to ?? undefined }
          : undefined,
    };

    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
        skip,
        take,
        include: {
          user: { select: { id: true, name: true, lastname: true } },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { items, total, page, limit };
  }
}
