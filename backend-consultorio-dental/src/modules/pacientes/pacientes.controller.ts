import { Controller, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../security/guards/auth.guard';

@UseGuards(AuthGuard)
@Controller('pacientes')
export class PacientesController {}
