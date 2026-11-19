import { Controller, Get } from '@nestjs/common';
import { Public } from '../../infrastructure/security/decorators/public.decorator';
import { DashboardService } from './dashboard.service';

/** Cifras agregadas para el sitio público (solo conteos, sin datos personales). */
@Controller('public')
export class PublicStatsController {
  constructor(private dashboardService: DashboardService) {}

  @Public()
  @Get('stats')
  async getStats() {
    return await this.dashboardService.getPublicStats();
  }
}
