import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { AuthRequest } from '../../infrastructure/security/auth-request';
import { AuthGuard } from '../../infrastructure/security/guards/auth.guard';
import { IsActiveUserGuard } from '../../infrastructure/security/guards/is-active-user.guard';
import { RolesGuard } from '../../infrastructure/security/guards/roles.guard';
import { Roles } from '../../infrastructure/security/decorators/roles.decorator';
import { Role } from '../users/enums/rol.enum';
import { NotificationsService } from './notifications.service';
import { GetNotificationsDto } from './dto/get-notifications.dto';

/** El id del usuario sale siempre del token, nunca de la peticion. */
function requireUserId(request: AuthRequest) {
  if (!request.user) throw new UnauthorizedException('No autenticado');
  return request.user.id;
}

@UseGuards(AuthGuard, IsActiveUserGuard, RolesGuard)
@Roles(Role.ADMINISTRADOR, Role.ASISTENTE, Role.PACIENTE)
@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  async getMine(
    @Query() filters: GetNotificationsDto,
    @Req() request: AuthRequest,
  ) {
    return await this.notificationsService.getMine(
      requireUserId(request),
      filters,
    );
  }

  @Get('unread-count')
  async getUnreadCount(@Req() request: AuthRequest) {
    return await this.notificationsService.getUnreadCount(
      requireUserId(request),
    );
  }

  @Patch('read-all')
  async markAllAsRead(@Req() request: AuthRequest) {
    return await this.notificationsService.markAllAsRead(
      requireUserId(request),
    );
  }

  @Patch(':id/read')
  async markAsRead(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthRequest,
  ) {
    return await this.notificationsService.markAsRead(
      id,
      requireUserId(request),
    );
  }
}
