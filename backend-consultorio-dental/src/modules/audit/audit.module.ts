import { Global, Module } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { SecurityModule } from '../../infrastructure/security/security.module';

@Global()
@Module({
  imports: [SecurityModule],
  controllers: [AuditController],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
