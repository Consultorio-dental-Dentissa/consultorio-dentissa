import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { resolvePagination } from 'src/infrastructure/common/dto/pagination.dto';
import { GetNotificationsDto } from '../dto/get-notifications.dto';

/** Todas las consultas filtran por user_id: nunca se accede a notificaciones ajenas. */
@Injectable()
export class NotificationsRepository {
  constructor(private prisma: PrismaService) {}

  async getAllByUser(userId: number, filters: GetNotificationsDto) {
    const { skip, take } = resolvePagination(filters);
    const where: Prisma.NotificationWhereInput = {
      user_id: userId,
      is_read: filters.read,
    };

    const [items, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
        skip,
        take,
        select: {
          id: true,
          type: true,
          message: true,
          is_read: true,
          read_at: true,
          appointment_id: true,
          created_at: true,
        },
      }),
      this.prisma.notification.count({ where }),
    ]);

    return { items, total };
  }

  async countUnread(userId: number) {
    return await this.prisma.notification.count({
      where: { user_id: userId, is_read: false },
    });
  }

  /** Marca una notificacion propia; devuelve false si no existe o es ajena. */
  async markAsRead(id: number, userId: number) {
    const now = new Date();
    const result = await this.prisma.notification.updateMany({
      where: { id, user_id: userId, is_read: false },
      data: { is_read: true, read_at: now },
    });

    if (result.count === 1) return true;

    // Ya estaba leida (idempotente) o no es del usuario
    const exists = await this.prisma.notification.count({
      where: { id, user_id: userId },
    });
    return exists > 0;
  }

  async markAllAsRead(userId: number) {
    const result = await this.prisma.notification.updateMany({
      where: { user_id: userId, is_read: false },
      data: { is_read: true, read_at: new Date() },
    });

    return result.count;
  }
}
