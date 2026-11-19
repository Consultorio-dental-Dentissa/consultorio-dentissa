import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { GetAuditLogsDto } from './dto/get-audit-logs.dto';
import { AuthGuard } from '../../infrastructure/security/guards/auth.guard';
import { IsActiveUserGuard } from '../../infrastructure/security/guards/is-active-user.guard';
import { RolesGuard } from '../../infrastructure/security/guards/roles.guard';
import { Roles } from '../../infrastructure/security/decorators/roles.decorator';
import { Role } from '../users/enums/rol.enum';

/** Solo lectura: la auditoria no expone endpoints de edicion ni borrado. */
@UseGuards(AuthGuard, IsActiveUserGuard, RolesGuard)
@Roles(Role.ADMINISTRADOR)
@Controller('audit-logs')
export class AuditController {
  constructor(private auditService: AuditService) {}

  @Get()
  async get(@Query() filters: GetAuditLogsDto) {
    return await this.auditService.findAll(filters);
  }
}
