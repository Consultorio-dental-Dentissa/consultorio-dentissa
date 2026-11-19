import { Module } from '@nestjs/common';
import { SecurityModule } from '../../infrastructure/security/security.module';
import { OffersController } from './offers.controller';
import { OffersService } from './offers.service';
import { OffersRepository } from './repositories/offers.repository';

@Module({
  imports: [SecurityModule],
  controllers: [OffersController],
  providers: [OffersService, OffersRepository],
})
export class OffersModule {}
