import { Module } from '@nestjs/common';
import { SecurityModule } from '../../infrastructure/security/security.module';
import { OdontogramController } from './odontogram.controller';
import { OdontogramService } from './odontogram.service';
import { OdontogramRepository } from './repositories/odontogram.repository';

@Module({
  imports: [SecurityModule],
  controllers: [OdontogramController],
  providers: [OdontogramService, OdontogramRepository],
  exports: [OdontogramService],
})
export class OdontogramModule {}
