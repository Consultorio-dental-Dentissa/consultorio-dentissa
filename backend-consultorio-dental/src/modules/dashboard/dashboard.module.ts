import { Module } from '@nestjs/common';
import { SecurityModule } from '../../infrastructure/security/security.module';
import { DashboardController } from './dashboard.controller';
import { PublicStatsController } from './public-stats.controller';
import { DashboardService } from './dashboard.service';
import { DashboardRepository } from './repositories/dashboard.repository';

@Module({
  imports: [SecurityModule],
  controllers: [DashboardController, PublicStatsController],
  providers: [DashboardService, DashboardRepository],
})
export class DashboardModule {}
