import { Module } from '@nestjs/common';
import { SecurityModule } from '../../infrastructure/security/security.module';
import { FaqController } from './faq.controller';
import { FaqService } from './faq.service';
import { FaqRepository } from './repositories/faq.repository';

@Module({
  imports: [SecurityModule],
  controllers: [FaqController],
  providers: [FaqService, FaqRepository],
})
export class FaqModule {}
