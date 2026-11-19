import { Injectable, NotFoundException } from '@nestjs/common';
import { resolvePagination } from 'src/infrastructure/common/dto/pagination.dto';
import { NotificationsRepository } from './repositories/notifications.repository';
import { GetNotificationsDto } from './dto/get-notifications.dto';

@Injectable()
export class NotificationsService {
  constructor(private notificationsRepository: NotificationsRepository) {}

  async getMine(userId: number, filters: GetNotificationsDto) {
    const { page, limit } = resolvePagination(filters);
    const { items, total } = await this.notificationsRepository.getAllByUser(
      userId,
      filters,
    );

    return { items, total, page, limit };
  }

  async getUnreadCount(userId: number) {
    return { unread: await this.notificationsRepository.countUnread(userId) };
  }

  async markAsRead(id: number, userId: number) {
    const found = await this.notificationsRepository.markAsRead(id, userId);

    // Ajena o inexistente: misma respuesta para no revelar su existencia
    if (!found) throw new NotFoundException('La notificación no existe');

    return { id, is_read: true };
  }

  async markAllAsRead(userId: number) {
    return {
      updated: await this.notificationsRepository.markAllAsRead(userId),
    };
  }
}
