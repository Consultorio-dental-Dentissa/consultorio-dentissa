import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../infrastructure/security/guards/auth.guard';
import { IsActiveUserGuard } from '../../infrastructure/security/guards/is-active-user.guard';
import { RolesGuard } from '../../infrastructure/security/guards/roles.guard';
import { Roles } from '../../infrastructure/security/decorators/roles.decorator';
import { Role } from '../users/enums/rol.enum';
import { DashboardService } from './dashboard.service';

/** Spec 01: el dashboard administrativo es solo del ADMINISTRADOR. */
@UseGuards(AuthGuard, IsActiveUserGuard, RolesGuard)
@Roles(Role.ADMINISTRADOR)
@Controller('dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('stats')
  async getStats() {
    return await this.dashboardService.getStats();
  }
}
