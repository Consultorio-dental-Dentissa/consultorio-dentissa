import { Module } from '@nestjs/common';
import { OdontogramsController } from './odontograms.controller';
import { OdontogramsService } from './odontograms.service';
import { OdontogramsRepository } from './repositories/odontograms.repository';
import { SecurityModule } from '../../infrastructure/security/security.module';

@Module({
  controllers: [OdontogramsController],
  providers: [
    OdontogramsService,
    OdontogramsRepository,
  ],
  exports: [OdontogramsRepository],
  imports: [
    SecurityModule
  ]
})
export class OdontogramsModule { }
