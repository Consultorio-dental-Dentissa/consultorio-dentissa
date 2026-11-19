import { Module } from '@nestjs/common';
import { SecurityModule } from '../../infrastructure/security/security.module';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationsRepository } from './repositories/notifications.repository';

@Module({
  imports: [SecurityModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsRepository],
})
export class NotificationsModule {}
