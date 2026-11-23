import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { AuthRequest } from '../../infrastructure/security/auth-request';
import { AuthGuard } from '../../infrastructure/security/guards/auth.guard';
import { IsActiveUserGuard } from '../../infrastructure/security/guards/is-active-user.guard';
import { RolesGuard } from '../../infrastructure/security/guards/roles.guard';
import { Roles } from '../../infrastructure/security/decorators/roles.decorator';
import { Role } from '../users/enums/rol.enum';
import { OdontogramService } from './odontogram.service';
import { UpdateToothDto } from './dto/update-tooth.dto';

/** Datos clinicos: SOLO ADMINISTRADOR (igual que las consultas). */
@UseGuards(AuthGuard, IsActiveUserGuard, RolesGuard)
@Roles(Role.ADMINISTRADOR)
@Controller('patients/:id/odontogram')
export class OdontogramController {
  constructor(private odontogramService: OdontogramService) {}

  @Get()
  async get(@Param('id', ParseIntPipe) id: number) {
    return await this.odontogramService.getByPatient(id);
  }

  @Put(':tooth')
  async updateTooth(
    @Param('id', ParseIntPipe) id: number,
    @Param('tooth', ParseIntPipe) tooth: number,
    @Body() dto: UpdateToothDto,
    @Req() request: AuthRequest,
  ) {
    if (!request.user) throw new UnauthorizedException('No autenticado');
    return await this.odontogramService.updateTooth(
      id,
      tooth,
      dto,
      request.user.id,
    );
  }
}
